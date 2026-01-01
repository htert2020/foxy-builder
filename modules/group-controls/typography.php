<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Typography extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'TYPOGRAPHY';
    }

    public function get_title()
    {
        return __('Typography', 'foxy-builder');
    }

    public function get_is_dropdown()
    {
        return true;
    }
    
    protected function _register_controls()
    {
        $default_slider_range = [
            'min' => 0.1,
            'max' => 10.0,
            'step' => 0.1,
        ];

        $this->add_control(
            'family',
            [
                'label' => __('Family', 'foxy-builder'),
                'type' => ControlType::$FONT,
                'selector_value' => 'font-family: {{VALUE}}',
            ]
        );
        
        $this->add_responsive_control(
            'size',
            [
                'label'   => __('Size', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem', 'vw' ],
                'range' => [
                    'px' => [
                        'min' => 1,
                        'max' => 200,
                        'step' => 1,
                    ],
                    'em' => $default_slider_range,
                    'rem' => $default_slider_range,
                    'vw' => $default_slider_range,
                ],
                'selector_value' => 'font-size: {{SIZE}}{{UNIT}}',
            ]
        );
        
        $this->add_control(
            'weight',
            [
                'label'   => __('Weight', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '' => 'Default',
                    '100' => '100 (Thin)',
                    '200' => '200 (Extra Light)',
                    '300' => '300 (Light)',
                    '400' => '400 (Normal)',
                    '500' => '500 (Medium)',
                    '600' => '600 (Semi Bold)',
                    '700' => '700 (Bold)',
                    '800' => '800 (Extra Bold)',
                    '900' => '900 (Black)',
                    'normal' => 'Normal',
                    'bold' => 'Bold',
                ],
                'selector_value' => 'font-weight: {{VALUE}}',
            ]
        );
        
        $this->add_control(
            'style',
            [
                'label'   => __('Style', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '' => 'Default',
                    'normal' => 'Normal',
                    'italic' => 'Italic',
                    'oblique' => 'Oblique',
                ],
                'selector_value' => 'font-style: {{VALUE}}',
            ]
        );
        
        $this->add_control(
            'transform',
            [
                'label'   => __('Transform', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '' => 'Default',
                    'uppercase' => 'Uppercase',
                    'lowercase' => 'Lowercase',
                    'capitalize' => 'Capitalize',
                    'none' => 'Normal',
                ],
                'selector_value' => 'text-transform: {{VALUE}}',
            ]
        );
        
        $this->add_control(
            'decoration',
            [
                'label'   => __('Decoration', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '' => 'Default',
                    'underline' => 'Underline',
                    'overline' => 'Overline',
                    'line-through' => 'Line Through',
                    'none' => 'None',
                ],
                'selector_value' => 'text-decoration: {{VALUE}}',
            ]
        );

        $this->add_responsive_control(
            'line_height',
            [
                'label'   => __('Line Height', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'step'    => 0.1,
                'selector_value' => 'line-height: {{VALUE}}',
            ]
        );

        $this->add_responsive_control(
            'letter_spacing',
            [
                'label'   => __('Letter Spacing', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem' ],
                'range' => [
                    'px' => [
                        'min' => -5,
                        'max' => 10,
                        'step' => 0.1,
                    ],
                    'em' => $default_slider_range,
                    'rem' => $default_slider_range,
                ],
                'selector_value' => 'letter-spacing: {{SIZE}}{{UNIT}}',
            ]
        );

        $this->add_responsive_control(
            'word_spacing',
            [
                'label'   => __('Word Spacing', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 100,
                        'step' => 1,
                    ],
                    'em' => $default_slider_range,
                    'rem' => $default_slider_range,
                ],
                'selector_value' => 'word-spacing: {{SIZE}}{{UNIT}}',
            ]
        );
    }
}
