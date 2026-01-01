<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class ImageSize extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'IMAGE_SIZE';
    }

    public function get_title()
    {
        return __('Image Size', 'foxy-builder');
    }

    public function get_is_dropdown()
    {
        return false;
    }
    
    protected function _register_controls()
    {
		global $_wp_additional_image_sizes;

		$image_sizes = [];

		foreach ([ 'thumbnail', 'medium', 'medium_large', 'large' ] as $size_name)
        {
			$image_sizes[$size_name] = [
				'width'  => (int)get_option($size_name . '_size_w'),
				'height' => (int)get_option($size_name . '_size_h'),
			];
		}

		if ($_wp_additional_image_sizes)
        {
			$image_sizes = array_merge($image_sizes, $_wp_additional_image_sizes);
		}

		$options = [];

		foreach ($image_sizes as $size_name => $dimensions)
        {
			$title = ucwords(str_replace('_', ' ', $size_name));

			if (is_array($dimensions))
            {
				$title .= sprintf(' - %d x %d', $dimensions['width'], $dimensions['height']);
			}

			$options[$size_name] = $title;
		}

		$options['full'] = __('Full', 'foxy-builder');

        $this->add_control(
            'size',
            [
                'label'   => __('Image Resolution', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => $options,
                'default' => 'full',
                'label_block' => true,
            ]
        );
    }
}
