<?php

namespace FoxyBuilder\Modules\Widgets\Basic;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

class Text extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_TEXT = 'text';

    public function get_name()
    {
        return 'foxybdr.basic.text';
    }
    
    public function get_title()
    {
        return 'Text';
    }
    
    public function get_icon()
    {
        return 'fas fa-align-justify';
    }
    
    public function get_categories()
    {
        return [ 'basic' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/basic/text.js';
    }

    protected function is_child_container()
    {
        return false;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Text', 'foxy-builder'),
                'name' => self::$TAB_TEXT,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'text_content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_TEXT,
            ]
        );

        $this->add_control(
            'text_content_html',
            [
                'label' => '',
                'type' => ControlType::$WYSIWYG,
                'default' => '<p>Lorem ipsum dolor sit amet, id eos decore accumsan explicari, id oportere inciderint pri, ipsum electram forensibus sit ad. Eum ancillae noluisse delicatissimi ei, alienum epicurei te pri. Per ut quod omnesque percipitur, ad mea quas consetetur quaerendum. At eos mucius volumus facilisi, id soleat noster virtute usu. Movet nihil dignissim vel at.</p>',
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'text_style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_TEXT,
            ]
        );

        $selector_text = '{{WRAPPER}} > .foxybdr-text';

        $this->add_group_control(
            GroupControlType::$TYPOGRAPHY,
            [
                'name' => 'text_style_typography',
                'label' => __('Typography', 'foxy-builder'),
                'selector' => $selector_text,
            ]
        );

        $this->add_control(
            'text_style_color',
            [
                'label' => __('Text Color', 'foxy-builder'),
                'type' => ControlType::$COLOR,
                'selectors' => [
                    $selector_text => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            GroupControlType::$TEXT_SHADOW,
            [
                'name' => 'text_style_text-shadow',
                'selector' => $selector_text,
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
