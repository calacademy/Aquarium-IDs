<?php

/**
 * Implements hook_drush_command().
 */
function calacademy_archive_drush_command() {
  $items['calacademy-archive'] = array(
    'description' => 'Run archiving routine on select tanks',
    'arguments' => array(
      'tanks' => 'Comma-delimited tanks to archive (or all)',
      'dryRun' => 'Dry run',
    ),
    'examples' => array(
      'Archive a single tank' => 'drush calacademy-archive AQG11',
      'Archive a collection of tanks' => 'drush calacademy-archive AQG11,AQJ11,CRE10',
      'Dry run archive a collection of tanks' => 'drush calacademy-archive AQG11,AQJ11,CRE10 dry-run',
      'Archive all tanks' => 'drush calacademy-archive all'
    )
  );

  return $items;
}

function drush_calacademy_archive($tanks, $dryRun = false) {
  print "\n";

  $dryRun = $dryRun == 'dry-run';
  $tanks = trim(strtolower($tanks));
  
  $args = [];
  $all = false;

  if ($tanks == 'all') {
  	$all = true;
  } else {
    $args = explode(',', $tanks);
  }

  if (!$all && count($args) == 0) {
    print "Invalid arguments\n\n";
    return;
  }

  // iterate vocab
  $vocab = taxonomy_vocabulary_machine_name_load('tanks_and_displays');
  $tree = taxonomy_get_tree($vocab->vid, 0, NULL, true);

  foreach ($tree as $tank) {
    if ($tank->depth === 0) continue;

    if ($all || in_array(strtolower($tank->name), $args)) {
      if ($dryRun) {
        print 'Dry run ' . $tank->name . "\n";
      } else {
        // start archiving
        if (_calacademy_archive_create($tank->tid, trim(strtolower($tank->name)), true)) {
          print 'Successfully archived ' . $tank->name . "\n";
        } else {
          print 'Archive failed for ' . $tank->name . "!\n";
        }
      }
    }    
  }

  print "\nDone archiving.\n\n";
}
