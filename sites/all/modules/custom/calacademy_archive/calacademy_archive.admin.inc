<?php

/**
 * Administration settings form.
 *
 * @see system_settings_form()
 */
function calacademy_archive_admin_settings() {
  variable_set('calacademy_archive_progress', 0);

  // checkbox for each tank
  $vocab = taxonomy_vocabulary_machine_name_load('tanks_and_displays');
  $tree = taxonomy_get_tree($vocab->vid, 0, NULL, true);

  foreach ($tree as $term) {
    if ($term->depth === 0) continue;

    $form['calacademy_archive_' . $term->tid] = array(
      '#type' => 'checkbox',
      '#title' => t($term->name)
    );
  }

  $form['results'] = array(
    '#prefix' => '<div id="archive-results">',
    '#suffix' => '</div>'
  );

  // AJAX submit
  $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Archive'),
      '#ajax' => array(
          'callback' => 'calacademy_archive_submit_callback',
          'wrapper' => 'archive-results',
          'progress' => array(
              'type' => 'bar',
              'message' => t('Archiving…'),
              'url' => '/archive/progress',
              'interval' => '500'
          )
      ),
  );

  return $form;
}
