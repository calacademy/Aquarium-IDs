<?php
	
	class CreateZip {
		private $_sourceDirectory;
		private $_tmpDirectory;
		private $_zipFile;
		private $_author;
		private $_server;
		private $_bucket = 'touchscreen-archives.calacademy.org';
		private $_index = 'index.json';

		private $_content = array();
		private $_json = array();
		private $_debug = false;

		public function __construct ($sourceDirectory, $author = '', $server = '', $debug = false) {
			$this->_tmpDirectory = realpath('tmp');
			$this->_sourceDirectory = $sourceDirectory;
			$this->_author = $author;
			$this->_server = $server;
			$this->_debug = $debug;
		}

		private function _exec ($cmd) {
			global $base_url;
			$bin = '/usr/bin/aws';

			if (strpos($base_url, '-local') !== false) {
				// local
				$bin = '/usr/local/bin/aws';
			}

			return shell_exec($bin . ' s3 ' . $cmd);
		}

		public function getBucketObjects () {
			$objects = array();

			$output = $this->_exec('ls s3://' . $this->_bucket);
			$lines = explode(PHP_EOL, trim($output));

			foreach ($lines as $line) {
				$arr = explode(' ', trim($line));
				$file = array_pop($arr);

				// skip non .zip files
				$ext = pathinfo($file, PATHINFO_EXTENSION);
				if (strtolower($ext) != 'zip') continue;

				$objects[] = $file;
			}

			return $objects;
		}

		public function upload ($path) {
			$output = $this->_exec('cp ' . $path . ' s3://' . $this->_bucket . '/' . basename($path) . ' --acl public-read --cache-control max-age=0');

			// @todo
			// error handling
			return true;
		}

		public function setIndex () {
			// create and upload index
			$objects = $this->getBucketObjects();
			$file = $this->_tmpDirectory . '/' . $this->_index;

			if (file_put_contents($file, json_encode($objects))) {
				$this->_exec('cp ' . $file . ' s3://' . $this->_bucket . '/' . $this->_index . ' --acl public-read --cache-control max-age=0');
				
				unlink($file);
				return true;
			} else {
				if ($this->_debug) print "Failed to write JSON index.\n";
				return false;
			}
		}

		public function delete ($tankName) {
			// query s3 and delete pre-existing
			$objects = $this->getBucketObjects();

			foreach ($objects as $object) {
				// only apply to .zip files
				if (strpos($object, '.zip') === false) continue;

				// remove extension
				$trimmed = basename($object, '.zip');
				
				$tank = array_pop(explode('_', $trimmed));

				if ($tank === $tankName) {
					// match, delete
					$this->_exec('rm s3://' . $this->_bucket . '/' . $object);
				}
			}
		}

		public function setTempDirectory ($dir) {
			$this->_tmpDirectory = $dir;
		}

		public function setJSON ($data) {
			$this->_json = $data;
		}

		public function addContent ($content) {
			$this->_content = array_merge($this->_content, $content);
		}

		public function getPath ($zipName = '') {
			if ($this->_createZip($zipName) === false) {
				if (file_exists($this->_zipFile)) {
					unlink($this->_zipFile);
				}

				if ($this->_debug) print "_createZip failed.\n";
				return false;
			} else {
				if (!file_exists($this->_zipFile)) {
					if ($this->_debug) print $this->_zipFile . " not found.\n";
					return false;
				}

				return $this->_tmpDirectory . '/' . basename($this->_zipFile);
			}

			return false;
		}

		private function _getCleanFilename ($string) {
   			$string = str_replace(' ', '-', $string);
   			return preg_replace('/[^A-Za-z0-9\-\_\.]/', '', $string);
		}

		private function _isSkip ($path, $checkDot = true) {
			// file doesn't exists or isn't readable
			if (!file_exists($path) || !is_readable($path)) { 
		      return true;
		    }

		    // don't check if there's a dot (uploaded content)
		    if (!$checkDot) return false;

		    // file or dir starts with a dot (system or sass tmp files, etc.)
			$arr = explode('/', $path);
			$skip = false;

			foreach ($arr as $dir) {
				if (substr($dir, 0, 1) == '.') {
					$skip = true;
					break;
				}
			}

			return $skip;
		}

		private function _getRemote ($url) {
		  $ch = curl_init();
		      
		  curl_setopt($ch, CURLOPT_HEADER, false);
		  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		  curl_setopt($ch, CURLOPT_URL, $url);
		  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		  
		  $result = curl_exec($ch);

		  if ($result === false) {
		  	watchdog('calacademy_archive', curl_error($ch), NULL, WATCHDOG_ERROR);
		  }

		  curl_close($ch);

		  if ($result === false) return false;
		  return $result;
		}

		private function _createZip ($zipName) {
			// validate source and target
			if (!is_dir($this->_sourceDirectory)) {
				if ($this->_debug) print $this->_sourceDirectory . " is not a directory.\n";
				return false;
			}

			if (!is_writable($this->_tmpDirectory)) {
				if ($this->_debug) print $this->_tmpDirectory . " is not writable.\n";
				return false;
			}

			// create zip
			if (empty($zipName)) {
				$zipName = basename($this->_sourceDirectory);
			}

			$zipName = $this->_getCleanFilename($zipName);

			$this->_zipFile = $this->_tmpDirectory . '/' . $zipName;

			$zip = new ZipArchive();

			if (!$zip->open($this->_zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
				if ($this->_debug) print $this->_zipFile . " cannot be opened for writing.\n";
				return false;
			}

			// add frontend code to archive
			$files = new RecursiveIteratorIterator(
			    new RecursiveDirectoryIterator($this->_sourceDirectory),
			    RecursiveIteratorIterator::LEAVES_ONLY
			);

			$parentDirectory = realpath($this->_sourceDirectory . '/..');

			foreach ($files as $name => $file) {
				if ($file->isDir()) continue;

				$filePath = $file->getRealPath();
				$toZip = str_replace($parentDirectory . '/', '', $filePath);

				if ($this->_isSkip($filePath)) {
					continue;
				}

				$zip->addFile($filePath, $toZip);
			}

			// add content to archive
			foreach ($this->_content as $file) {
				$target = basename($this->_sourceDirectory) . '/' . $file['target'];

				if (file_exists($file['src'])) {
					$zip->addFile($file['src'], $target);
				} else {
					// do a fake request to generate image derivative
					$str = $this->_getRemote($file['url']);

					if (is_string($str)) {
						// add as string
						$zip->addFromString($target, $str);
					}
				}
			}

			// add JSON config to archive
			$comment = '';
			$time = date('c');

			if (empty($this->_author) || empty($this->_server)) {
				$comment .= "// Archived at {$time}.\n";
			} else {
				$comment .= "// Archived by {$this->_author} from {$this->_server} at {$time}.\n";
			}
			
			$comment .= "// Note: Absolute URLs are stripped when run locally.\n";

			foreach ($this->_json as $key => $val) {
				// validate JSON
				$decoded = json_decode($val);
				
				if ($decoded === NULL || empty($decoded)) {
					if ($this->_debug) print "JSON not validated, quit archiving.\n";
					return false;
				}

				$jsonFilePath = basename($this->_sourceDirectory) . '/data/' . $key . '.jsonp';
				$zip->addFromString($jsonFilePath, $comment . '_jqjsp(' . $val . ');');
			}

			// finish up
			$status = $zip->getStatusString();
			
			if (!$zip->close()) {
				if ($this->_debug) print "Zip close failed.\n";
				return false;
			}

			return $status !== false;
		}
	}

?>
