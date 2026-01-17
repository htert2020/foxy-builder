<?php

namespace FoxyBuilder\Modules\Controls;

if (!defined('ABSPATH'))
    exit;

class ControlUtils
{
    public static function get_image_sizes()
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

        return $options;
    }
}
