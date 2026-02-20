<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widget-instance-sanitizer.php';

class ComponentSanitizer
{
	private $widget_instance_sanitizer;

    public function __construct($widget_instance_sanitizer)
    {
		$this->widget_instance_sanitizer = $widget_instance_sanitizer;
    }

	public function sanitize(&$old_obj)
    {
        $new_obj = [];

        if (!is_array($old_obj) || array_is_list($old_obj))
            return null;

        if (!isset($old_obj['id']))
            return null;

        $new_obj['id'] = (int)$old_obj['id'];

        if (!isset($old_obj['title']) || !is_string($old_obj['title']))
            return null;

        $new_obj['title'] = $old_obj['title'];

        $new_obj['children'] = [];

        if (isset($old_obj['children']) && is_array($old_obj['children']) && array_is_list($old_obj['children']))
        {
            foreach ($old_obj['children'] as &$child)
            {
				$sanitized_child = $this->widget_instance_sanitizer->sanitize($child);
                    
				if ($sanitized_child !== null)
                    $new_obj['children'][] = $sanitized_child;
            }
        }

        return $new_obj;
    }

	/* Function json_encode: See comments in "widget-instance-sanitizer.php" for an explanation of why this function is needed. */
	public function json_encode(&$obj)
	{
		$pairs = [];

		$pairs[] = '"id":' . json_encode($obj['id']);  // Call the real PHP json_encode function.
		$pairs[] = '"title":' . json_encode($obj['title']);

		$children = [];
		foreach ($obj['children'] as &$child)
		{
			$encoded_child = $this->widget_instance_sanitizer->json_encode($child);

			$children[] = $encoded_child;
		}
		$pairs[] = '"children":[' . implode(',', $children) . ']';

		return '{' . implode(',', $pairs) . '}';
	}
}
