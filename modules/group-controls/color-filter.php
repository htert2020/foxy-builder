<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class ColorFilter extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'COLOR_FILTER';
    }

    public function get_title()
    {
        return __('Color Filter', 'foxy-builder');
    }

    public function get_is_dropdown()
    {
        return true;
    }
    
    protected function _register_controls()
    {
        $this->add_control(
            'enabled',
            [
                'label' => __('Enable', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
                'selectors' => [
                    '{{SELECTOR}}' => 'filter: brightness(var(--foxybdr-filter-brightness)) contrast(var(--foxybdr-filter-contrast)) saturate(var(--foxybdr-filter-saturation)) blur(var(--foxybdr-filter-blur)) hue-rotate(var(--foxybdr-filter-hue))',
                ],
            ]
        );

        $this->add_control(
            "var-brightness-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-brightness: 100%",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'brightness',
            [
                'label'   => __('Brightness', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ '%' ],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 200,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-brightness: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-contrast-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-contrast: 100%",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'contrast',
            [
                'label'   => __('Contrast', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ '%' ],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 200,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-contrast: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-saturation-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-saturation: 100%",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'saturation',
            [
                'label'   => __('Saturation', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ '%' ],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 200,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-saturation: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-blur-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-blur: 0px",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'blur',
            [
                'label'   => __('Blur', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px' ],
                'range' => [
                    'px' => [
                        'min'  => 0,
                        'max'  => 10,
                        'step' => 0.1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-blur: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-hue-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-hue: 0deg",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'hue',
            [
                'label'   => __('Hue Rotation', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'deg' ],
                'range' => [
                    'deg' => [
                        'min'  => 0,
                        'max'  => 360,
                    ],
                ],
                'default' => [
                    'unit' => 'deg',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-filter-hue: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );
    }
}
