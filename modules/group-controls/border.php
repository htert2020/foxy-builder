<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Border extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'BORDER';
    }

    public function get_title()
    {
        return __('Border', 'foxy-builder');
    }

    public function get_is_dropdown()
    {
        return false;
    }
    
    protected function _register_controls()
    {
        $this->add_control(
            'style',
            [
                'label'   => __('Border Type', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''       => __('Default', 'foxy-builder'),
                    'none'   => __('None', 'foxy-builder'),
                    'solid'  => __('Solid', 'foxy-builder'),
                    'double' => __('Double', 'foxy-builder'),
                    'dotted' => __('Dotted', 'foxy-builder'),
                    'dashed' => __('Dashed', 'foxy-builder'),
                    'groove' => __('Groove', 'foxy-builder'),
                ],
                'default' => '',
                'selectors' => [
                    '{{SELECTOR}}' => 'border-style: {{VALUE}}',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'width',
            [
                'label' => __('Border Width', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'size_units' => [ 'px', 'em', 'rem', 'vw' ],
                'selectors' => [
                    '{{SELECTOR}}' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
                ],
                'condition' => [
                    'style!' => [ '', 'none' ],
                ],
            ]
        );

        $this->add_control(
            'color',
            [
                'label' => __('Border Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'selectors' => [
                    '{{SELECTOR}}' => 'border-color: {{VALUE}}',
                ],
                'condition' => [
                    'style!' => [ '', 'none' ],
                ],
            ]
        );
    }
}
