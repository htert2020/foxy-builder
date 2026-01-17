<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class TextShadow extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'TEXT_SHADOW';
    }

    public function get_title()
    {
        return __('Text Shadow', 'foxy-builder');
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
                    '{{SELECTOR}}' => 'text-shadow: var(--foxybdr-text-shadow-horizontal) var(--foxybdr-text-shadow-vertical) var(--foxybdr-text-shadow-blur) var(--foxybdr-text-shadow-color)',
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-horizontal: 0px",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-horizontal: {{SIZE}}{{UNIT}}",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-vertical: 0px",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-vertical: {{SIZE}}{{UNIT}}",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-blur: 0px",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-blur: {{SIZE}}{{UNIT}}",
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
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-color: #0000004D",
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
                'default' => '#0000004D',
                'selectors' => [
                    '{{SELECTOR}}' => "--foxybdr-text-shadow-color: {{VALUE}}",
                ],
                'condition' => [
                    'enabled' => 'yes',
                ],
            ]
        );
    }
}
