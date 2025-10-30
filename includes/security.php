<?php

namespace FoxyBuilder\Includes;

if (!defined('ABSPATH'))
    exit;

class Security
{
	public static function sanitize_request($super_global, $key)
    {
		if (!isset($super_global[$key]))
			return null;

		if ($super_global === $_FILES)
			return isset($super_global[$key]['name']) ? self::sanitize_file($super_global[$key]) : self::sanitize_files($super_global[$key]);

		return wp_kses_post_deep(wp_unslash($super_global[$key]));
	}

	private static function sanitize_files($files)
    {
		return array_map(function($file) {
			return array_map('self::sanitize_file', $file);
		}, $files);
	}

	private static function sanitize_file($file)
    {
		$file['name'] = sanitize_file_name($file['name']);

		return $file;
	}

	public static function sanitize_strings_deep($item)
	{
		if ($item === null)
			return $item;
		
		if (is_string($item))
			return wp_kses_post_deep(wp_unslash($item));

		if (!is_array($item))
			return $item;

		$new_array = [];

		foreach ($item as $key => $value)
		{
			$key = self::sanitize_strings_deep($key);
			$value = self::sanitize_strings_deep($value);
			$new_array[$key] = $value;
		}

		return $new_array;
	}
}
