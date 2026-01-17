<?php

namespace FoxyBuilder\Modules\Widgets;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-utils.php';

use \FoxyBuilder\Modules\Controls\ControlType;

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

    protected static $TAB_CONTENT = 'content';

    protected static $TAB_STYLE = 'style';

    protected static $TAB_ADVANCED = 'advanced';

    protected $title = '';

    protected $icon = '';

    protected $tabs = [];

    protected $tab_index = -1;

    protected $section_index = -1;

    protected $settings = [];

    protected $evaluated_settings = [];

    protected $eval_mode = false;

    protected $render_js_file_path = '';

    protected $is_child_container = false;

    protected function declare_tabs()  // Overriding this method is welcome and encouraged.
    {
        $this->tabs = [
            [
                'title' => 'Content',
                'name' => self::$TAB_CONTENT,
                'sections' => [],
            ],
            [
                'title' => 'Style',
                'name' => self::$TAB_STYLE,
                'sections' => [],
            ],
            [
                'title' => 'Advanced',
                'name' => self::$TAB_ADVANCED,
                'sections' => [],
            ],
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

    protected function add_controls_background($tab, $setting_prefix, $selector)
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
                        "background-attachment: var(--foxybdr-background-attachment-1);",
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
                        "background-attachment: var(--foxybdr-background-attachment-1), var(--foxybdr-background-attachment-2);",
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
                        "background-attachment: var(--foxybdr-background-attachment-1), var(--foxybdr-background-attachment-2), var(--foxybdr-background-attachment-3);",
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

            $this->end_controls_section();
        }
    }
}
