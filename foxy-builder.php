<?php
/**
 * Plugin Name: Foxy Builder
 * Plugin URI: https://www.foxywebsite.com/builder/
 * Description: Drag and drop page builder, pixel perfect design, mobile responsive editing, and more. Create stunningly beautiful web pages and hero sections for your WordPress website.
 * Version: 1.0.0
 * Author: Foxy Website LLC
 * Author URI: https://www.foxywebsite.com/builder/
 * Text Domain: foxy-builder
 */

namespace FoxyBuilder;

if (!defined('ABSPATH'))
	exit;

define('FOXYBUILDER_VERSION', '1.0.0');
define('FOXYBUILDER_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('FOXYBUILDER_PLUGIN_PATHANDFILE', __FILE__);
define('FOXYBUILDER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FOXYBUILDER_TEXT_DOMAIN', 'foxy-builder');

require_once FOXYBUILDER_PLUGIN_PATH . '/main.php';

Main::instance();
