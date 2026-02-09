<?php

namespace FoxyBuilder\Modules\Widgets\Basic;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

class Heading extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_HEADING = 'heading';

    public function get_name()
    {
        return 'foxybdr.basic.heading';
    }
    
    public function get_title()
    {
        return 'Heading';
    }
    
    public function get_icon()
    {
        return 'fas fa-heading';
    }
    
    public function get_categories()
    {
        return [ 'basic' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/basic/heading.js';
    }

    protected function is_child_container()
    {
        return false;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Heading', 'foxy-builder'),
                'name' => self::$TAB_HEADING,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'heading_content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_HEADING,
            ]
        );

        $this->add_control(
            'heading_content_title',
            [
                'label'   => __('Title', 'foxy-builder'),
                'type'    => ControlType::$TEXTAREA,
                'label_block' => true,
                'default' => __('Sample Heading Text', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'heading_content_divider_1',
            [
                'type' => ControlType::$DIVIDER,
                'margin_bottom_small' => true,
            ]
        );
        
        $this->add_control(
            'heading_content_link',
            [
                'label'   => __('Link', 'foxy-builder'),
                'type'    => ControlType::$URL,
                'placeholder' => __('Enter URL', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'heading_content_link-new-window',
            [
                'label' => __('Open in New Window', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'heading_content_link-no-follow',
            [
                'label' => __('Add nofollow', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'heading_content_tag',
            [
                'label'   => __('HTML Tag', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'separator' => 'before',
                'options' => [
                    'h1'   => __('H1', 'foxy-builder'),
                    'h2'   => __('H2', 'foxy-builder'),
                    'h3'   => __('H3', 'foxy-builder'),
                    'h4'   => __('H4', 'foxy-builder'),
                    'h5'   => __('H5', 'foxy-builder'),
                    'h6'   => __('H6', 'foxy-builder'),
                    'div'  => __('div', 'foxy-builder'),
                    'span' => __('span', 'foxy-builder'),
                    'p'    => __('p', 'foxy-builder'),
                ],
                'default' => 'h2',
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'heading_style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_HEADING,
            ]
        );

        $selector_heading = '{{WRAPPER}} > .foxybdr-title';

        $this->add_group_control(
            GroupControlType::$TYPOGRAPHY,
            [
                'name' => 'heading_style_typography',
                'label' => __('Typography', 'foxy-builder'),
                'selector' => $selector_heading,
            ]
        );

        $this->add_control(
            'heading_style_color',
            [
                'label' => __('Text Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'selectors' => [
                    $selector_heading => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'heading_style_stroke-color',
            [
                'label' => __('Stroke Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'separator' => 'before',
                'selectors' => [
                    $selector_heading => 'stroke: {{VALUE}}; -webkit-text-stroke-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'heading_style_stroke-width',
            [
                'label'   => __('Stroke Width', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'selectors' => [
                    $selector_heading => 'stroke-width: {{VALUE}}px; -webkit-text-stroke-width: {{VALUE}}px',
                ],
            ]
        );

        $this->add_control(
            'heading_style_blend-mode',
            [
                'label'   => __('Blend Mode', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'separator' => 'before',
                'options' => [
                    ''            => __('Default', 'foxy-builder'),
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
                'selectors' => [
                    $selector_heading => "mix-blend-mode: {{VALUE}}",
                ],
            ]
        );

        $this->add_group_control(
            GroupControlType::$TEXT_SHADOW,
            [
                'name' => 'heading_style_text-shadow',
                'selector' => $selector_heading,
            ]
        );

        $this->end_controls_section();


        $this->add_controls_widget(self::$TAB_WIDGET);


        $this->add_controls_advanced(self::$TAB_ADVANCED);
    }

    protected function render()
    {

    }
}
