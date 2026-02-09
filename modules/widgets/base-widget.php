<?php

namespace FoxyBuilder\Modules\Widgets;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-utils.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

abstract class BaseWidget
{
    abstract public function get_name();
    
    abstract public function get_title();
    
    abstract public function get_icon();
    
    abstract public function get_categories();

    abstract public function get_render_js_file_path();

    abstract protected function _register_controls();

    abstract protected function render();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BASE CLASS MEMBERS AND METHODS
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    protected static $TAB_WIDGET = 'widget';

    protected static $TAB_ADVANCED = 'advanced';

    protected $title = '';

    protected $icon = '';

    protected $tabs = [];

    protected $tab_index = -1;

    protected $section_index = -1;

    protected $settings = [];

    protected $evaluated_settings = [];

    protected $defaults = [];

    protected $omit_settings = [];

    protected $eval_mode = false;

    protected $render_js_file_path = '';

    protected $is_child_container = false;

    protected function declare_tabs()  // Overriding this method is welcome and encouraged.
    {
        $this->tabs[] = [
            'title' => 'Widget',
            'name' => self::$TAB_WIDGET,
            'sections' => [],
        ];

        $this->tabs[] = [
            'title' => 'Advanced',
            'name' => self::$TAB_ADVANCED,
            'sections' => [],
        ];
    }

    protected function is_child_container()
    {
        return false;
    }

    public function build_widget_definition()
    {
        $this->title = $this->get_title();
        $this->icon = $this->get_icon();
        $this->render_js_file_path = $this->get_render_js_file_path();
        $this->is_child_container = $this->is_child_container();

        $this->declare_tabs();
        $this->_register_controls();

        return [
            'title' => $this->title,
            'icon' => $this->icon,
            'tabs' => $this->tabs,
            'settings' => $this->settings,
            'render' => $this->render_js_file_path,
            'container' => $this->is_child_container,
        ];
    }

    public function start_controls_section($section_name, $args)
    {
        if ($this->eval_mode)
            return;

        $tab_index = -1;

        for ($i = 0; $i < count($this->tabs); $i++)
        {
            $tab = $this->tabs[$i];

            if ($tab['name'] === $args['tab'])
            {
                $tab_index = $i;
                break;
            }
        }

        if ($tab_index === -1)
            return false;

        $this->tab_index = $tab_index;

        $tab = &$this->tabs[$this->tab_index];

        $new_section = [
            'title' => $args['label'],
            'name' => $section_name,
            'settings' =>  []
        ];

        if (isset($args['condition']))
            $new_section['condition'] = $args['condition'];

        $tab['sections'][] = $new_section;

        $this->section_index = count($tab['sections']) - 1;

        return true;
    }

    public function end_controls_section()
    {
        if ($this->eval_mode)
            return;

        $this->tab_index = -1;
        $this->section_index = -1;
    }

    public function add_control($setting_name, $args)
    {
        if (in_array($setting_name, $this->omit_settings))
            return false;

        if (isset($this->defaults[$setting_name]))
        {
            $args['default'] = $this->defaults[$setting_name];
        }

        if ($this->eval_mode)
        {
            $this->settings[$setting_name] = $args;
            return;
        }

        if ($this->tab_index === -1 || $this->section_index === -1)
            return false;

        $tab = &$this->tabs[$this->tab_index];
        $section = &$tab['sections'][$this->section_index];
        $section['settings'][] = [
            'type' => 'setting',
            'name' => $setting_name,
        ];

        $this->settings[$setting_name] = $args;

        return true;
    }

    public function add_responsive_control($setting_name, $args)
    {
        $this->add_control($setting_name, array_merge($args, [ 'responsive' => true ]));
    }

    public function add_group_control($group_control_type, $args)
    {
        $args['type'] = ControlType::$GROUP;
        $args['sub_type'] = $group_control_type;

        $setting_name = $args['name'];
        unset($args['name']);

        $this->add_control($setting_name, $args);
    }

    public function start_controls_tabs()
    {
        return $this->add_layout('start_controls_tabs', null);
    }

    public function end_controls_tabs()
    {
        return $this->add_layout('end_controls_tabs', null);
    }

    public function start_controls_tab($label)
    {
        return $this->add_layout('start_controls_tab', $label);
    }

    public function end_controls_tab()
    {
        return $this->add_layout('end_controls_tab', null);
    }

    public function start_popover($label)
    {
        return $this->add_layout('start_popover', $label);
    }

    public function end_popover()
    {
        return $this->add_layout('end_popover', null);
    }

    protected function add_layout($type, $label)
    {
        if ($this->eval_mode)
            return;

        if ($this->tab_index === -1 || $this->section_index === -1)
            return false;

        $tab = &$this->tabs[$this->tab_index];
        $section = &$tab['sections'][$this->section_index];
        $section['settings'][] = [
            'type' => $type,
            'label' => $label,
        ];

        return true;
    }

    protected function add_defaults($new_defaults)
    {
        $this->defaults = array_merge($this->defaults, $new_defaults);
    }

    protected function omit_setting($setting_name)
    {
        $this->omit_settings[] = $setting_name;
    }

    public function init_render()
    {
        $this->eval_mode = true;

        $this->_register_controls();
    }

    public function render_widget_instance($widget_instance)
    {
        $this->evaluate_settings($widget_instance);

        $this->render();
    }

    protected function evaluate_settings($widget_instance)
    {
        $this->evaluated_settings = [];

    }

	final public function get_settings($setting_name = null)
    {
        if ($setting_name !== null)
            if (isset($this->evaluated_settings[$setting_name]))
                return $this->evaluated_settings[$setting_name];
            else
                return null;
        else
    		return $this->evaluated_settings;
	}

    protected function add_controls_widget($tab)
    {
        $selector_widget = '{{WIDGET}}';
        $selector_wrapper = '{{WRAPPER}}';

        $setting_prefix = 'widget';

        $this->add_controls_boundary($tab, $selector_wrapper, $setting_prefix);

        $this->add_controls_position($tab, $selector_widget, $setting_prefix);

        $this->add_controls_size($tab, $selector_widget, $setting_prefix);

        $this->add_controls_background($tab, $selector_wrapper, $setting_prefix);

        $this->add_controls_layout($tab, $selector_widget, $setting_prefix);
    }

    protected function add_controls_position($tab, $selector = '{{WIDGET}}', $setting_prefix = 'widget')
    {
        $this->start_controls_section(
            "{$setting_prefix}_position",
            [
                'label' => __('Position', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_control(
            "{$setting_prefix}_position_position",
            [
                'label'   => __('Position', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''         => __('Default', 'foxy-builder'),
                    'absolute' => __('Absolute', 'foxy-builder'),
                    'fixed'    => __('Fixed', 'foxy-builder'),
                ],
                'selectors' => [
                    $selector => 'position: {{VALUE}}; width: auto;',
                ],
            ]
        );

        $this->add_control(
            "{$setting_prefix}_position_horizontal-side",
            [
                'label' => __('Horizontal Side', 'foxy-builder'),
                'type' => ControlType::$CHOOSE,
                'options' => [
                    'left' => [
                        'title' => __('Left Side', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-arrow-right',
                    ],
                    'right' => [
                        'title' => __('Right Side', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-arrow-left',
                    ],
                ],
                'selectors' => [
                    $selector => "{{VALUE}}: var(--foxybdr-position-horizontal-offset, 0px)",
                ],
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_position_horizontal-offset",
            [
                'label'   => __('Horizontal Offset', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', '%', 'vw', 'vh' ],
                'range' => [
                    'px' => [
                        'min' => -400,
                        'max' =>  400,
                    ],
                    '%' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                    'vw' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                    'vh' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    $selector => "--foxybdr-position-horizontal-offset: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    "{$setting_prefix}_position_horizontal-side!" => '',
                ],
            ]
        );

        $this->add_control(
            "{$setting_prefix}_position_vertical-side",
            [
                'label' => __('Vertical Side', 'foxy-builder'),
                'type' => ControlType::$CHOOSE,
                'options' => [
                    'top' => [
                        'title' => __('Top Side', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-arrow-down',
                    ],
                    'bottom' => [
                        'title' => __('Bottom Side', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-arrow-up',
                    ],
                ],
                'selectors' => [
                    $selector => "{{VALUE}}: var(--foxybdr-position-vertical-offset, 0px)",
                ],
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_position_vertical-offset",
            [
                'label'   => __('Vertical Offset', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', '%', 'vw', 'vh' ],
                'range' => [
                    'px' => [
                        'min' => -400,
                        'max' =>  400,
                    ],
                    '%' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                    'vw' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                    'vh' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    $selector => "--foxybdr-position-vertical-offset: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    "{$setting_prefix}_position_vertical-side!" => '',
                ],
            ]
        );

        $this->add_control(
            "{$setting_prefix}_position_z-index",
            [
                'label'   => __('Z Position', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'separator' => 'before',
                'selectors' => [
                    $selector => 'z-index: {{VALUE}}',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function add_controls_size($tab, $selector = '{{WIDGET}}', $setting_prefix = 'widget')
    {
        $this->start_controls_section(
            "{$setting_prefix}_size",
            [
                'label' => __('Size', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_control(
            "{$setting_prefix}_size_width",
            [
                'label'   => __('Width', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '' => __('Default', 'foxy-builder'),
                    'auto' => __('Auto', 'foxy-builder'),
                    'var(--foxybdr-widget-width, 100%)' => __('Custom', 'foxy-builder'),
                ],
                'selectors' => [
                    $selector => 'width: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_size_width-custom",
            [
                'label'   => __('Custom Width', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', '%' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 800,
                    ],
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'selectors' => [
                    $selector => "--foxybdr-widget-width: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    "{$setting_prefix}_size_width" => 'var(--foxybdr-widget-width, 100%)',
                ],
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_size_vertical-alignment",
            [
                'label'   => __('Vertical Alignment', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'description' => 'Vertical Alignment controls this widget\'s vertical alignment relative to other widgets positioned on the same line.',
                'options' => [
                    ''           => __('Default', 'foxy-builder'),
                    'stretch'    => __('Stretch', 'foxy-builder'),
                    'flex-start' => __('Top', 'foxy-builder'),
                    'center'     => __('Middle', 'foxy-builder'),
                    'flex-end'   => __('Bottom', 'foxy-builder'),
                ],
                'selectors' => [
                    $selector => 'align-self: {{VALUE}}',
                ],
                'condition' => [
                    "{$setting_prefix}_size_width!" => '',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function add_controls_boundary($tab, $selector = '{{WRAPPER}}', $setting_prefix = 'widget')
    {
        $this->start_controls_section(
            "{$setting_prefix}_boundary",
            [
                'label' => __('Boundary', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_boundary_margin",
            [
                'label' => __('Margin', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'selectors' => [
                    $selector => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
                ],
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_boundary_padding",
            [
                'label' => __('Padding', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'selectors' => [
                    $selector => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
                ],
            ]
        );

        $this->add_group_control(
            GroupControlType::$BORDER,
            [
                'name' => "{$setting_prefix}_boundary_border",
                'selector' => $selector,
                'separator' => 'before',
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_boundary_border-radius",
            [
                'label' => __('Border Radius', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'sub_type' => 'corners',
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'selectors' => [
                    $selector => 'border-radius: {{LEFT}}{{UNIT}} {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}}',
                ],
            ]
        );

        $this->add_group_control(
            GroupControlType::$BOX_SHADOW,
            [
                'name' => "{$setting_prefix}_boundary_box-shadow",
                'selector' => $selector,
                'separator' => 'before',
            ]
        );

        $this->end_controls_section();
    }

    protected function add_controls_background($tab, $selector = '{{WRAPPER}}', $setting_prefix = 'widget')
    {
        $image_size_options = \FoxyBuilder\Modules\Controls\ControlUtils::get_image_sizes();

        $this->start_controls_section(
            "{$setting_prefix}_background",
            [
                'label' => __('Background', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_control(
            "{$setting_prefix}_background_color",
            [
                'label' => __('Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'selectors' => [
                    $selector => 'background-color: {{VALUE}}',
                ],
            ]
        );
        
        $this->add_control(
            "{$setting_prefix}_background_layer-count",
            [
                'label'   => __('Number of Layers', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '0'   => __('None', 'foxy-builder'),
                    '1'   => __('1', 'foxy-builder'),
                    '2'   => __('2', 'foxy-builder'),
                    '3'   => __('3', 'foxy-builder'),
                ],
                'default' => '0',
            ]
        );
        
        $this->add_control(
            "{$setting_prefix}_background_prop-1",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    $selector =>
                        "background-image: var(--foxybdr-background-image-1);" .
                        "background-position: var(--foxybdr-background-position-1);" .
                        "background-size: var(--foxybdr-background-size-1);" .
                        "background-repeat: var(--foxybdr-background-repeat-1);" .
                        "background-attachment: var(--foxybdr-background-attachment-1);" .
                        "background-blend-mode: var(--foxybdr-background-blend-mode-1);",
                ],
                'condition' => [
                    "{$setting_prefix}_background_layer-count" => '1',
                ],
            ]
        );
        
        $this->add_control(
            "{$setting_prefix}_background_prop-2",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    $selector =>
                        "background-image: var(--foxybdr-background-image-1), var(--foxybdr-background-image-2);" .
                        "background-position: var(--foxybdr-background-position-1), var(--foxybdr-background-position-2);" .
                        "background-size: var(--foxybdr-background-size-1), var(--foxybdr-background-size-2);" .
                        "background-repeat: var(--foxybdr-background-repeat-1), var(--foxybdr-background-repeat-2);" .
                        "background-attachment: var(--foxybdr-background-attachment-1), var(--foxybdr-background-attachment-2);" .
                        "background-blend-mode: var(--foxybdr-background-blend-mode-1), var(--foxybdr-background-blend-mode-2);",
                ],
                'condition' => [
                    "{$setting_prefix}_background_layer-count" => '2',
                ],
            ]
        );
        
        $this->add_control(
            "{$setting_prefix}_background_prop-3",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    $selector =>
                        "background-image: var(--foxybdr-background-image-1), var(--foxybdr-background-image-2), var(--foxybdr-background-image-3);" .
                        "background-position: var(--foxybdr-background-position-1), var(--foxybdr-background-position-2), var(--foxybdr-background-position-3);" .
                        "background-size: var(--foxybdr-background-size-1), var(--foxybdr-background-size-2), var(--foxybdr-background-size-3);" .
                        "background-repeat: var(--foxybdr-background-repeat-1), var(--foxybdr-background-repeat-2), var(--foxybdr-background-repeat-3);" .
                        "background-attachment: var(--foxybdr-background-attachment-1), var(--foxybdr-background-attachment-2), var(--foxybdr-background-attachment-3);" .
                        "background-blend-mode: var(--foxybdr-background-blend-mode-1), var(--foxybdr-background-blend-mode-2), var(--foxybdr-background-blend-mode-3);",
                ],
                'condition' => [
                    "{$setting_prefix}_background_layer-count" => '3',
                ],
            ]
        );
        
        $this->end_controls_section();

        for ($i = 1; $i <= 3; $i++)
        {
            $section_prefix = "{$setting_prefix}_background-layer-{$i}";

            $condition_list = [];
            for ($k = $i; $k <= 3; $k++)
                $condition_list[] = (string)$k;

            $this->start_controls_section(
                $section_prefix,
                [
                    'label' => __('Background Layer #', 'foxy-builder') . (string)$i,
                    'tab' => $tab,
                    'condition' => [
                        "{$setting_prefix}_background_layer-count" => $condition_list,
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-position-default",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-position-{$i}: 0% 0%",
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-size-default",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-size-{$i}: auto",
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-repeat-default",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-repeat-{$i}: repeat",
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-attachment-default",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-attachment-{$i}: scroll",
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_type",
                [
                    'label'   => __('Type', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'image'           => __('Image', 'foxy-builder'),
                        'linear_gradient' => __('Linear Gradient', 'foxy-builder'),
                        'radial_gradient' => __('Radial Gradient', 'foxy-builder'),
                    ],
                    'default' => 'image',
                ]
            );
            
            $this->add_control(
                "{$section_prefix}_image-media",
                [
                    'label' => __('Choose Image', 'foxy-builder'),
                    'type'  => ControlType::$MEDIA,
                    'media_title' => 'Image',
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_image-size",
                [
                    'label'   => __('Image Resolution', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => $image_size_options,
                    'default' => 'full',
                    'label_block' => true,
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );
    
            $this->add_control(
                "{$section_prefix}_var-background-image-image",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-image-{$i}: url(\"{{|image-url|{$section_prefix}_image-media.id|{$section_prefix}_image-media.url|{$section_prefix}_image-size.value}}\")",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_image-media.url!" => '',
                    ],
                ]
            );
            
            $this->add_control(
                "{$section_prefix}_var-background-image-image-empty",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-image-{$i}: none",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_image-media.url" => '',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_divider_misc",
                [
                    'type' => ControlType::$DIVIDER,
                    'margin_bottom_small' => true,
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );
            
            $this->add_control(
                "{$section_prefix}_position-x",
                [
                    'label'   => __('Position (X)', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ 'px', '%' ],
                    'range' => [
                        'px' => [
                            'min' => 0,
                            'max' => 800,
                        ],
                        '%' => [
                            'min' => 0,
                            'max' => 100,
                        ],
                    ],
                    'default' => [
                        'unit' => '%',
                        'size' => 0,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_position-y",
                [
                    'label'   => __('Position (Y)', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ 'px', '%' ],
                    'range' => [
                        'px' => [
                            'min' => 0,
                            'max' => 800,
                        ],
                        '%' => [
                            'min' => 0,
                            'max' => 100,
                        ],
                    ],
                    'default' => [
                        'unit' => '%',
                        'size' => 0,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-position",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-position-{$i}: {{{$section_prefix}_position-x.size}}{{{$section_prefix}_position-x.unit}} {{{$section_prefix}_position-y.size}}{{{$section_prefix}_position-y.unit}}",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_position-x.size!" => '',
                        "{$section_prefix}_position-y.size!" => '',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_size",
                [
                    'label'   => __('Size', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'auto'    => __('Default', 'foxy-builder'),
                        'cover'   => __('Cover', 'foxy-builder'),
                        'contain' => __('Contain', 'foxy-builder'),
                        'custom'  => __('Custom', 'foxy-builder'),
                    ],
                    'default' => 'auto',
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_size-width",
                [
                    'label'   => __('Custom Width', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ 'px', '%' ],
                    'range' => [
                        'px' => [
                            'min' => 0,
                            'max' => 1000,
                        ],
                        '%' => [
                            'min' => 0,
                            'max' => 100,
                        ],
                    ],
                    'default' => [
                        'unit' => '%',
                        'size' => 100,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_size" => 'custom',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-size",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-size-{$i}: {{{$section_prefix}_size.value}}",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_size!" => 'custom',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-size-custom",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-size-{$i}: {{{$section_prefix}_size-width.size}}{{{$section_prefix}_size-width.unit}} auto",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                        "{$section_prefix}_size" => 'custom',
                        "{$section_prefix}_size-width.size!" => '',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_repeat",
                [
                    'label'   => __('Repeat', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'repeat'    => __('Repeat', 'foxy-builder'),
                        'repeat-x'  => __('Repeat X', 'foxy-builder'),
                        'repeat-y'  => __('Repeat Y', 'foxy-builder'),
                        'no-repeat' => __('No Repeat', 'foxy-builder'),
                    ],
                    'default' => 'repeat',
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-repeat",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-repeat-{$i}: {{{$section_prefix}_repeat.value}}",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_attachment",
                [
                    'label'   => __('Attachment', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'scroll' => __('Scroll', 'foxy-builder'),
                        'fixed'  => __('Fixed', 'foxy-builder'),
                        'local'  => __('Local', 'foxy-builder'),
                    ],
                    'default' => 'scroll',
                    'selectors' => [
                        $selector => "--foxybdr-background-attachment-{$i}: {{value}}",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'image',
                    ],
                ]
            );
            
            $this->add_control(
                "{$section_prefix}_linear-direction",
                [
                    'label'   => __('Direction', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ 'deg' ],
                    'range' => [
                        'deg' => [
                            'min' => 0,
                            'max' => 360,
                        ],
                    ],
                    'default' => [
                        'unit' => 'deg',
                        'size' => 0,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'linear_gradient',
                    ],
                ]
            );
            
            $this->add_control(
                "{$section_prefix}_var-background-image-linear",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-image-{$i}: linear-gradient({{{$section_prefix}_linear-direction.size}}deg, var(--foxybdr-color-stops-{$i}))",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'linear_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_radial-center-x",
                [
                    'label'   => __('Radial Center (X)', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ '%' ],
                    'range' => [
                        '%' => [
                            'min' => 0,
                            'max' => 100,
                        ],
                    ],
                    'default' => [
                        'unit' => '%',
                        'size' => 50,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'radial_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_radial-center-y",
                [
                    'label'   => __('Radial Center (Y)', 'foxy-builder'),
                    'type'    => ControlType::$SLIDER,
                    'size_units' => [ '%' ],
                    'range' => [
                        '%' => [
                            'min' => 0,
                            'max' => 100,
                        ],
                    ],
                    'default' => [
                        'unit' => '%',
                        'size' => 50,
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'radial_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_radial-shape",
                [
                    'label'   => __('Shape', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'ellipse' => __('Ellipse', 'foxy-builder'),
                        'circle'  => __('Circle', 'foxy-builder'),
                    ],
                    'default' => 'ellipse',
                    'condition' => [
                        "{$section_prefix}_type" => 'radial_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_radial-extent",
                [
                    'label'   => __('Size', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        'farthest-corner' => __('Farthest Corner', 'foxy-builder'),
                        'farthest-side'   => __('Farthest Side', 'foxy-builder'),
                        'closest-corner'  => __('Closest Corner', 'foxy-builder'),
                        'closest-side'    => __('Closest Side', 'foxy-builder'),
                    ],
                    'default' => 'farthest-corner',
                    'condition' => [
                        "{$section_prefix}_type" => 'radial_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_var-background-image-radial",
                [
                    'label'   => '',
                    'type'    => ControlType::$HIDDEN,
                    'default' => '.',
                    'selectors' => [
                        $selector => "--foxybdr-background-image-{$i}: radial-gradient({{{$section_prefix}_radial-shape.value}} {{{$section_prefix}_radial-extent.value}} at {{{$section_prefix}_radial-center-x.size}}% {{{$section_prefix}_radial-center-y.size}}%, var(--foxybdr-color-stops-{$i}))",
                    ],
                    'condition' => [
                        "{$section_prefix}_type" => 'radial_gradient',
                    ],
                ]
            );

            $this->add_control(
                "{$section_prefix}_colorstop-count",
                [
                    'label'   => __('Number of Colors', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'options' => [
                        '2' => __('2', 'foxy-builder'),
                        '3' => __('3', 'foxy-builder'),
                        '4' => __('4', 'foxy-builder'),
                    ],
                    'default' => '2',
                    'condition' => [
                        "{$section_prefix}_type" => [ 'linear_gradient', 'radial_gradient' ],
                    ],
                ]
            );

            $default_colorstop_colors = [ '#ff0000', '#ffff00', '#00ff00', '#00ffff' ];
            $default_colorstop_locations = [ 0, 100, 100, 100 ];

            for ($j = 1; $j <= 4; $j++)
            {
                $condition_list = [];
                for ($k = $j; $k <= 4; $k++)
                    $condition_list[] = (string)$k;

                $this->add_control(
                    "{$section_prefix}_colorstop-{$j}-color",
                    [
                        'label' => __('Color #', 'foxy-builder') . (string)$j,
                        'type' => ControlType::$COLOR,
                        'default' => $default_colorstop_colors[$j - 1],
                        'separator' => 'before',
                        'prevent_empty' => true,
                        'condition' => [
                            "{$section_prefix}_type" => [ 'linear_gradient', 'radial_gradient' ],
                            "{$section_prefix}_colorstop-count" => $condition_list,
                        ],
                    ]
                );
                
                $this->add_control(
                    "{$section_prefix}_colorstop-{$j}-location",
                    [
                        'label'   => __('Location #', 'foxy-builder') . (string)$j,
                        'type'    => ControlType::$SLIDER,
                        'size_units' => [ '%' ],
                        'range' => [
                            '%' => [
                                'min' => 0,
                                'max' => 100,
                            ],
                        ],
                        'default' => [
                            'unit' => '%',
                            'size' => $default_colorstop_locations[$j - 1],
                        ],
                        'condition' => [
                            "{$section_prefix}_type" => [ 'linear_gradient', 'radial_gradient' ],
                            "{$section_prefix}_colorstop-count" => $condition_list,
                        ],
                    ]
                );

                $color_stops = [];
                for ($k = 1; $k <= $j; $k++)
                    $color_stops[] = "{{{$section_prefix}_colorstop-{$k}-color.value}} {{{$section_prefix}_colorstop-{$k}-location.size}}%";
                $color_stops = implode(', ', $color_stops);

                $this->add_control(
                    "{$section_prefix}_var-color-stops-{$j}",
                    [
                        'label'   => '',
                        'type'    => ControlType::$HIDDEN,
                        'default' => '.',
                        'selectors' => [
                            $selector => "--foxybdr-color-stops-{$i}: {$color_stops}",
                        ],
                        'condition' => [
                            "{$section_prefix}_type" => [ 'linear_gradient', 'radial_gradient' ],
                            "{$section_prefix}_colorstop-count" => (string)$j,
                        ],
                    ]
                );
            }

            $this->add_control(
                "{$section_prefix}_blend-mode",
                [
                    'label'   => __('Blend Mode', 'foxy-builder'),
                    'type'    => ControlType::$SELECT,
                    'separator' => 'before',
                    'options' => [
                        'normal'      => __('Normal', 'foxy-builder'),
                        'darken'      => __('Darken', 'foxy-builder'),
                        'multiply'    => __('Multiply', 'foxy-builder'),
                        'color-burn'  => __('Color Burn', 'foxy-builder'),
                        'lighten'     => __('Lighten', 'foxy-builder'),
                        'screen'      => __('Screen', 'foxy-builder'),
                        'color-dodge' => __('Color Dodge', 'foxy-builder'),
                        'overlay'     => __('Overlay', 'foxy-builder'),
                        'soft-light'  => __('Soft Light', 'foxy-builder'),
                        'hard-light'  => __('Hard Light', 'foxy-builder'),
                        'difference'  => __('Difference', 'foxy-builder'),
                        'exclusion'   => __('Exclusion', 'foxy-builder'),
                        'hue'         => __('Hue', 'foxy-builder'),
                        'saturation'  => __('Saturation', 'foxy-builder'),
                        'color'       => __('Color', 'foxy-builder'),
                        'luminosity'  => __('Luminosity', 'foxy-builder'),
                    ],
                    'default' => 'normal',
                    'selectors' => [
                        $selector => "--foxybdr-background-blend-mode-{$i}: {{VALUE}}",
                    ],
                ]
            );
    
            $this->end_controls_section();
        }
    }

    protected function add_controls_layout($tab, $selector = '{{WIDGET}}', $setting_prefix = 'widget')
    {
        $this->start_controls_section(
            "{$setting_prefix}_layout",
            [
                'label' => __('Layout', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_responsive_control(
            "{$setting_prefix}_layout_horizontal-alignment",
            [
                'label' => __('Alignment', 'foxy-builder'),
                'type' => ControlType::$CHOOSE,
                'options' => [
                    'left' => [
                        'title' => __('Left', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-editor-alignleft',
                    ],
                    'center' => [
                        'title' => __('Center', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-editor-aligncenter',
                    ],
                    'right' => [
                        'title' => __('Right', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-editor-alignright',
                    ],
                    'justify' => [
                        'title' => __('Justified', 'foxy-builder'),
                        'icon' => 'dashicons dashicons-editor-justify',
                    ],
                ],
                'selectors' => [
                    $selector => 'text-align: {{VALUE}}',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function add_controls_advanced($tab)
    {
        $selector_widget = '{{WIDGET}}';

        $setting_prefix = 'advanced';

        $this->add_controls_css($tab, $selector_widget, $setting_prefix);
    }

    protected function add_controls_css($tab, $selector = '{{WIDGET}}', $setting_prefix = 'advanced')
    {
        $this->start_controls_section(
            "{$setting_prefix}_css",
            [
                'label' => __('CSS', 'foxy-builder'),
                'tab' => $tab,
            ]
        );

        $this->add_control(
            "{$setting_prefix}_css_id",
            [
                'label'   => __('CSS ID', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'description' => 'Enter ID without the # symbol.',
            ]
        );

        $this->add_control(
            "{$setting_prefix}_css_classes",
            [
                'label'   => __('CSS Classes', 'foxy-builder'),
                'type'    => ControlType::$TEXTAREA,
                'description' => 'Enter class name(s) without the dot symbol.',
            ]
        );

        $this->end_controls_section();
    }
}
