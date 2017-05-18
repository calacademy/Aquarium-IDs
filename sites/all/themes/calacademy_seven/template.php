<?php

function calacademy_seven_preprocess_page(&$variables, $hook) {
	// if (!user_is_logged_in() && variable_get('tfa_enabled', false)) {
	// 	if (variable_get('calacademy_tfa_required', false)) {
	// 		drupal_set_message('Two-factor authentication is required for all users. Please contact a site administrator for assistance.', 'warning');
	// 	} else {
	// 		drupal_set_message('Two-factor authentication will soon be required for all users. Please setup Google Authenticator using the &ldquo;Security&rdquo; tab <a href="/user">here</a> after logging in.', 'warning');
	// 	}
	// }

	if (user_is_logged_in() && variable_get('tfa_enabled', false)) {
		global $user;
		$user_data = user_load($user->uid);

		$numSet = false;

		if (isset($user_data->field_mobile_number['und'][0]['value'])) {
			if (!empty($user_data->field_mobile_number['und'][0]['value'])) {
				$numSet = true;
			}
		}

		if (!$numSet) {
			drupal_set_message('Two-factor authentication will soon be required. Please enter your mobile number <a href="/user/'. $user->uid .'/edit">here</a>.', 'warning');
		}
	}
}
