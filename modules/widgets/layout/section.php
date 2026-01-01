<?php

namespace FoxyBuilder\Modules\Widgets\Layout;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

class Section extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    public function get_name()
    {
        return 'foxybdr.layout.section';
    }
    
    public function get_title()
    {
        return 'Section';
    }
    
    public function get_icon()
    {
        return 'foxybdr-fa-section';
    }
    
    public function get_categories()
    {
        return [ 'layout' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/layout/section.js';
    }

    protected function is_child_container()
    {
        return true;
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_CONTENT,
            ]
        );
        
        $this->add_control(
            'content_text',
            [
                'label'   => __('Text', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'placeholder' => __('Default Text', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'content_description',
            [
                'label'   => __('Description', 'foxy-builder'),
                'type'    => ControlType::$TEXTAREA,
                'default' => __('', 'foxy-builder'),
                'placeholder' => __('This is a cool website.', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'content_wysiwyg',
            [
                'label' => 'Wysiwyg Text',
                'type' => ControlType::$WYSIWYG,
            ]
        );
        
        $this->add_control(
            'content_url',
            [
                'label'   => __('URL', 'foxy-builder'),
                'type'    => ControlType::$URL,
                'placeholder' => __('http://www.mysite.com', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'content_image',
            [
                'label' => __('Choose Image #1', 'foxy-builder'),
                'type'  => ControlType::$MEDIA,
                'media_title' => 'Image',
            ]
        );

        $this->add_group_control(
            GroupControlType::$IMAGE_SIZE,
            [
                'name' => 'content_imagesize',
            ]
        );

        $this->add_control(
            'content_icon',
            [
                'label' => __('Icon', 'foxy-builder'),
                'type' => ControlType::$ICONS,
                'default' => [
                    'value' => 'fas fa-star',
                    'library' => 'fa-solid',
                ],
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_STYLE,
            ]
        );

        $this->add_group_control(
            GroupControlType::$TYPOGRAPHY,
            [
                'name' => 'style_typography',
                'label' => __('Text Typography', 'foxy-builder'),
                'selector' => '{{WRAPPER}} > div',
                'exclude' => [],
            ]
        );

        $this->add_control(
            'style_fontfamily',
            [
                'label' => __('Font Family', 'foxy-builder'),
                'type' => ControlType::$FONT,
                'selectors' => [
                    '{{WRAPPER}} > div' => 'font-family: {{VALUE}}',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'style_height',
            [
                'label'   => __('Height', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ '%', 'px', 'em' ],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                    'px' => [
                        'min' => 0,
                        'max' => 1000,
                        'step' => 1,
                    ],
                    'em' => [
                        'min' => 0.00,
                        'max' => 1.00,
                        'step' => 0.01,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 40,
                ],
                'selectors' => [
                    '{{WRAPPER}} > div' => 'height: {{SIZE}}{{UNIT}}',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'style_min_height',
            [
                'label'   => __('Min Height', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'default' => 20,
                'selectors' => [
                    '{{WRAPPER}} > div' => 'min-height: {{VALUE}}px',
                ],
            ]
        );

        $this->add_responsive_control(
            'style_padding',
            [
                'label' => __('Padding', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                //'sub_type' => 'corners',
                'size_units' => [ 'px', '%', 'em' ],
                'selectors' => [
                    '{{WRAPPER}} > div' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'style_alignment',
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
                ],
                //'default' => 'left',
                'selectors' => [
                    '{{WRAPPER}} > div' => 'text-align: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            "style_test_color",
            [
                'label' => __('Test Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'selectors' => [
                    '{{WRAPPER}} > div' => 'background-color: {{VALUE}}',
                ],
            ]
        );
        
        $this->add_control(
            'style_yellow',
            [
                'label' => __('Yellow', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} > div' => 'background-color: #ffff00',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
