<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class BoxShadow extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'BOX_SHADOW';
    }

    public function get_title()
    {
        return __('Box Shadow', 'foxy-builder');
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
                    '{{SELECTOR}}' => 'box-shadow: var(--foxybdr-box-shadow-horizontal) var(--foxybdr-box-shadow-vertical) var(--foxybdr-box-shadow-blur) var(--foxybdr-box-shadow-spread) var(--foxybdr-box-shadow-color) {{position.value}}',
                ],
            ]
        );

        $this->add_control(
            "var-horizontal-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-horizontal: 0px",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'horizontal',
            [
                'label'   => __('Horizontal', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px' ],
                'range' => [
                    'px' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-horizontal: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-vertical-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-vertical: 0px",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'vertical',
            [
                'label'   => __('Vertical', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px' ],
                'range' => [
                    'px' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-vertical: {{SIZE}}{{UNIT}}",
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
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-blur: 0px",
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
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-blur: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-spread-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-spread: 0px",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'spread',
            [
                'label'   => __('Spread', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px' ],
                'range' => [
                    'px' => [
                        'min' => -100,
                        'max' =>  100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0,
                ],
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-spread: {{SIZE}}{{UNIT}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            "var-color-default",
            [
                'label'   => '',
                'type'    => ControlType::$HIDDEN,
                'default' => '.',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-color: #00000080",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'color',
            [
                'label' => __('Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'default' => '#00000080',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-box-shadow-color: {{VALUE}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'position',
            [
                'label'   => __('Position', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ' '     => __('Outline', 'foxy-builder'),
                    'inset' => __('Inset', 'foxy-builder'),
                ],
                'default' => ' ',
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );
    }
}
