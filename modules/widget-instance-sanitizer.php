<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class WidgetInstanceSanitizer
{
    private $group_controls;

    private $widgets;

    public static $VALID_UNITS = [ '', ' ', 'px', '%', 'em', 'rem', 'vw', 'vh', 'deg', 's' ];

    public function __construct($group_controls, $widgets)
    {
        $this->group_controls = $group_controls;
        $this->widgets = $widgets;
    }

    public function sanitize(&$old_obj)
    {
        $new_obj = [];

        if (!is_array($old_obj) || $this->array_is_list($old_obj))
            return null;

        if (!isset($old_obj['id']) || !is_string($old_obj['id']))
            return null;

        $new_obj['id'] = $old_obj['id'];

        if (!isset($old_obj['widgetType']))
            return null;

        $new_obj['widgetType'] = (int)$old_obj['widgetType'];

        switch ($new_obj['widgetType'])
        {
            case 0:
                if (isset($old_obj['widgetID']) && is_string($old_obj['widgetID']))
                    $new_obj['widgetID'] = $old_obj['widgetID'];
                break;

            case 1:
                if (isset($old_obj['widgetID']))
                    $new_obj['widgetID'] = (int)$old_obj['widgetID'];
                break;
        }

        if (!isset($new_obj['widgetID']))
            return null;

        if (!isset($old_obj['sparseSettings']) || !is_array($old_obj['sparseSettings']) || $this->array_is_list($old_obj['sparseSettings']))
            return null;

		$new_obj['sparseSettings'] = [];

        if ($new_obj['widgetType'] === 0)
        {
            $widgetID = $new_obj['widgetID'];

            if (!isset($this->widgets[$widgetID]))
				return null;

			$widget = &$this->widgets[$widgetID];

			foreach ($old_obj['sparseSettings'] as $setting_name => $setting_value)
			{
				if (!isset($widget['settings'][$setting_name]))
					continue;

				$setting_params = &$widget['settings'][$setting_name];

				$sanitized_value = $this->sanitize_control_value($setting_value, $setting_params);

				if ($sanitized_value !== null)
					$new_obj['sparseSettings'][$setting_name] = $sanitized_value;
			}
        }

        $new_obj['children'] = [];

        if (isset($old_obj['children']) && is_array($old_obj['children']) && $this->array_is_list($old_obj['children']))
        {
            foreach ($old_obj['children'] as &$child)
            {
                $sanitized_child = $this->sanitize($child);

                if ($sanitized_child !== null)
                    $new_obj['children'][] = $sanitized_child;
            }
        }

        return $new_obj;
    }

	private function sanitize_control_value($value, &$setting_params, $responsive_override = null)
	{
		if ($value === null)
			return null;

        $responsive = isset($setting_params['responsive']) ? $setting_params['responsive'] : false;

        if ($responsive_override !== null)
            $responsive = $responsive_override;

		if ($responsive === true)
		{
			if (!is_array($value) || $this->array_is_list($value))
				return null;

			$retval = [];

			foreach ($value as $device => $sub_value)
			{
				if (!in_array($device, [ 'desktop', 'tablet', 'mobile' ], true))
					return null;

				$sanitized_sub_value = $this->sanitize_control_value($sub_value, $setting_params, false);

				if ($sanitized_sub_value !== null)
					$retval[$device] = $sanitized_sub_value;
			}

			return $retval;
		}

		switch ($setting_params['type'])
		{
			case ControlType::$TEXT:
			case ControlType::$TEXTAREA:
			case ControlType::$WYSIWYG:
			case ControlType::$URL:
				{
					if (is_string($value))
						return $value;
				}
				break;

            case ControlType::$SELECT:
            case ControlType::$CHOOSE:
                {
                    if (is_string($value) && isset($setting_params['options'][$value]))
                        return $value;
                }
                break;

			case ControlType::$SWITCHER:
				{
					if (is_string($value) && in_array($value, [ '', 'yes' ], true))
						return $value;
				}
				break;
		
			case ControlType::$NUMBER:
				{
					if ($this->is_number_value($value))
						return $this->numerize($value);
				}
				break;
		
			case ControlType::$SLIDER:
				{
					if (is_array($value) && !$this->array_is_list($value))
					{
						if (isset($value['size']) && isset($value['unit']))
						{
							$valid_size = $this->is_number_value($value['size']);
							$valid_unit = in_array($value['unit'], self::$VALID_UNITS, true);

							if ($valid_size && $valid_unit)
							{
								return [
									'size' => $this->numerize($value['size']),
									'unit' => $value['unit'],
								];
							}
						}
					}
				}
				break;
		
			case ControlType::$DIMENSIONS:
				{
					if (is_array($value) && !$this->array_is_list($value))
					{
						if (isset($value['left']) && isset($value['top']) && isset($value['right']) && isset($value['bottom']) && isset($value['unit']) && isset($value['locked']))
						{
							$valid_left   = $this->is_number_value($value['left']);
							$valid_top    = $this->is_number_value($value['top']);
							$valid_right  = $this->is_number_value($value['right']);
							$valid_bottom = $this->is_number_value($value['bottom']);
							$valid_unit   = in_array($value['unit'], self::$VALID_UNITS, true);

							if ($valid_left && $valid_top && $valid_right && $valid_bottom && $valid_unit)
							{
								return [
									'left'   => $this->numerize($value['left']),
									'top'    => $this->numerize($value['top']),
									'right'  => $this->numerize($value['right']),
									'bottom' => $this->numerize($value['bottom']),
									'unit'   => $value['unit'],
									'locked' => in_array($value['locked'], [ true, '1' ], true),
								];
							}
						}
					}
				}
				break;
		
			case ControlType::$COLOR:
				{
					if (is_string($value))
					{
						if ($value === '' ||
							preg_match("/^var\\(--foxybdr-global-color-(\d+)\\)$/", $value) === 1 ||
							preg_match("/^#[0-9a-fA-F]{6}$/", $value) === 1 ||
							preg_match("/^#[0-9a-fA-F]{8}$/", $value) === 1)
						{
							return $value;
						}
					}
				}
				break;
		
			case ControlType::$MEDIA:
				{
					if (is_array($value) && !$this->array_is_list($value))
					{
						if (isset($value['id']) && isset($value['url']))
						{
							$valid_id = $this->is_number_value($value['id']);
							$valid_url = is_string($value['url']);

							if ($valid_id && $valid_url)
							{
								return [
									'id'  => $this->numerize($value['id']),
									'url' => $value['url'],
								];
							}
						}
					}
				}
				break;
		
			case ControlType::$FONT:
				{
					if (is_array($value) && !$this->array_is_list($value))
					{
						if (isset($value['group']) && isset($value['id']) && isset($value['value']) &&
							is_string($value['group']) && is_string($value['id']) && is_string($value['value']))
						{
							if ($value['group'] === '.' && preg_match("/^[0-9]+$/", $value['id']) === 1 && preg_match("/^var\\(--foxybdr-global-font-(\d+)\\)$/", $value['value']) === 1 || $value['group'] !== '.')
							{
								return [
									'group' => $value['group'],
									'id'    => $value['id'],
									'value' => $value['value'],
								];
							}
						}
					}
				}
				break;
		
			case ControlType::$ICONS:
				{
					if (is_array($value) && !$this->array_is_list($value))
					{
						if (isset($value['library']) && isset($value['value']) &&
							is_string($value['library']) && is_string($value['value']))
						{
							return [
								'library' => $value['library'],
								'value' => $value['value'],
							];
						}
					}
				}
				break;
		
			case ControlType::$GROUP:
				{
                    if (is_array($value) && !$this->array_is_list($value))
                    {
                        $sub_type = $setting_params['sub_type'];
                        $group_settings = $this->group_controls[$sub_type]['settings'];

                        $retval = [];

                        foreach ($value as $setting_name => $setting_value)
                        {
                            if (!isset($group_settings[$setting_name]))
                                continue;

                            $sanitized_value = $this->sanitize_control_value($setting_value, $group_settings[$setting_name]);

                            if ($sanitized_value !== null)
                                $retval[$setting_name] = $sanitized_value;
                        }
    
                        return $retval;
                    }
				}
				break;
		
			case ControlType::$REPEATER:
				{
                    if (is_array($value) && ($this->array_is_list($value) || count($value) === 0))
                    {
                        $repeater_settings = $setting_params['fields']['settings'];

                        $retval = [];

                        foreach ($value as $item)
                        {
                            if (!is_array($item) || $this->array_is_list($item))
                                continue;

                            $new_item = [];

                            foreach ($item as $setting_name => $setting_value)
                            {
                                if (!isset($repeater_settings[$setting_name]))
                                    continue;

                                $sanitized_value = $this->sanitize_control_value($setting_value, $repeater_settings[$setting_name]);

                                if ($sanitized_value !== null)
                                    $new_item[$setting_name] = $sanitized_value;
                            }

                            $retval[] = $new_item;
                        }

                        return $retval;
                    }
				}
				break;
		
			case ControlType::$HIDDEN:
			case ControlType::$HEADING:
			case ControlType::$DIVIDER:
			case ControlType::$RAW_HTML:
				{
					if (is_string($value))
						return $value;
				}
				break;
		}

		return null;
	}

	/* Function json_encode: Parameter $obj is a widget instance data object tree. It must have been previously sanitized with a call
	 * to the sanitize method above. */
	/* This function was written to overcome PHP json_encode's inability to distinguish between an empty associative array ([]) and an
	 * empty list array (also []) in PHP, as a fully encoded json string does make that distinction with its {} and [] notations. Since
	 * the parameter $obj is a complex, hierarchical object that may potentially contain empty associative as well as empty list arrays,
	 * simply calling PHP's json_encode may result in incorrect behavior. In particular, the "sparseSettings", "children", GROUP, and
	 * REPEATER data inside the $obj object may be empty PHP associative or list arrays. An empty PHP array ([]) is ambiguous as to
	 * whether it is intended to be an associative array (i.e. with key/value pairs) or a list array (i.e. indexed from 0, 1, 2, 3, etc).
	 * Although PHP json_encode has a flag named 'JSON_FORCE_OBJECT', that does not provide a solution here. */
	public function json_encode(&$obj)
	{
		$pairs = [];

		$pairs[] = '"id":' . json_encode($obj['id']);  // Call the real PHP json_encode function.
		$pairs[] = '"widgetType":' . json_encode($obj['widgetType']);
		$pairs[] = '"widgetID":' . json_encode($obj['widgetID']);

		$sparseSettings = [];
        if ($obj['widgetType'] === 0)
        {
            $widgetID = $obj['widgetID'];

			$widget = &$this->widgets[$widgetID];

			foreach ($obj['sparseSettings'] as $setting_name => $setting_value)
			{
				$setting_params = &$widget['settings'][$setting_name];

				$encoded_value = $this->json_encode_control_value($setting_value, $setting_params);

				$sparseSettings[] = '"' . $setting_name . '":' . $encoded_value;
			}
        }
		$pairs[] = '"sparseSettings":{' . implode(',', $sparseSettings) . '}';

		$children = [];
		foreach ($obj['children'] as &$child)
		{
			$encoded_child = $this->json_encode($child);

			$children[] = $encoded_child;
		}
		$pairs[] = '"children":[' . implode(',', $children) . ']';

		return '{' . implode(',', $pairs) . '}';
	}

	private function json_encode_control_value($value, &$setting_params, $responsive_override = null)
	{
        $responsive = isset($setting_params['responsive']) ? $setting_params['responsive'] : false;

        if ($responsive_override !== null)
            $responsive = $responsive_override;

		if ($responsive === true)
		{
			$retval = [];

			foreach ($value as $device => $sub_value)
			{
				$encoded_sub_value = $this->json_encode_control_value($sub_value, $setting_params, false);

				$retval[] = '"' . $device . '":' . $encoded_sub_value;
			}

			return '{' . implode(',', $retval) . '}';
		}

		switch ($setting_params['type'])
		{
			case ControlType::$GROUP:
				{
					$sub_type = $setting_params['sub_type'];
					$group_settings = $this->group_controls[$sub_type]['settings'];

					$retval = [];

					foreach ($value as $setting_name => $setting_value)
					{
						$encoded_value = $this->json_encode_control_value($setting_value, $group_settings[$setting_name]);

						$retval[] = '"' . $setting_name . '":' . $encoded_value;
					}

					return '{' . implode(',', $retval) . '}';
				}
				break;
		
			case ControlType::$REPEATER:
				{
					$repeater_settings = $setting_params['fields']['settings'];

					$retval = [];

					foreach ($value as $item)
					{
						$new_item = [];

						foreach ($item as $setting_name => $setting_value)
						{
							$encoded_value = $this->json_encode_control_value($setting_value, $repeater_settings[$setting_name]);

							$new_item[] = '"' . $setting_name . '":' . $encoded_value;
						}

						$retval[] = '{' . implode(',', $new_item) . '}';
					}

					return '[' . implode(',', $retval) . ']';
				}
				break;
	
			default:
				{
					return json_encode($value);
				}
				break;
		}

		// We should never get here.
		return null;
	}

	private function array_is_list(&$arr)
	{
		return count($arr) > 0 && array_is_list($arr);
	}

	private function is_number_value($value)
	{
		return $value === '' || is_numeric($value);
	}

	private function numerize($value)
	{
		if ($value === '' || is_int($value) || is_float($value))
			return $value;

		if ($value === (string)(int)$value)
			return (int)$value;

		return (float)$value;
	}
}
