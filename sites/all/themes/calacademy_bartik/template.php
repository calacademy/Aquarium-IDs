<?php

function calacademy_bartik_preprocess_page(&$variables, $hook) {
  switch (request_path()) {
    case '':
    case 'user':
      if (!user_is_logged_in() && variable_get('tfa_enabled', false)) {
        if (variable_get('calacademy_tfa_required', false)) {
          drupal_set_message('Two-factor authentication is required for all users. Please contact a site administrator for assistance.', 'warning');
        } else {
          drupal_set_message('Two-factor authentication will soon be required for all users. Please setup Google Authenticator using the &ldquo;Security&rdquo; tab <a href="/user">here</a> after logging in.', 'warning');
        }
      }
      break;
  }
}
