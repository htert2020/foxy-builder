<?php

namespace FoxyBuilder\Modules\Widgets\Settings;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Site extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_SITE_IDENTITY = 'site-identity';

    protected static $TAB_COLORS = 'colors';

    protected static $TAB_FONTS = 'fonts';

    protected static $TAB_DEFAULT_STYLES = 'default-styles';

    protected static $TAB_BREAKPOINTS = 'breakpoints';

    protected static $TAB_GLOBAL_CSS = 'global-css';

    public function get_name()
    {
        return 'foxybdr.settings.site';
    }
    
    public function get_title()
    {
        return 'Site Settings';
    }
    
    public function get_icon()
    {
        return '';
    }
    
    public function get_categories()
    {
        return [];
    }

    public function get_render_js_file_path()
    {
        return null;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Site Identity', 'foxy-builder'),
                'name' => self::$TAB_SITE_IDENTITY,
                'sections' => [],
            ],
            [
                'title' => __('Colors', 'foxy-builder'),
                'name' => self::$TAB_COLORS,
                'sections' => [],
            ],
            [
                'title' => __('Fonts', 'foxy-builder'),
                'name' => self::$TAB_FONTS,
                'sections' => [],
            ],
            [
                'title' => __('Default Styles', 'foxy-builder'),
                'name' => self::$TAB_DEFAULT_STYLES,
                'sections' => [],
            ],
            [
                'title' => __('Breakpoints', 'foxy-builder'),
                'name' => self::$TAB_BREAKPOINTS,
                'sections' => [],
            ],
            [
                'title' => __('Global CSS', 'foxy-builder'),
                'name' => self::$TAB_GLOBAL_CSS,
                'sections' => [],
            ],
        ];
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'website',
            [
                'label' => __('Website', 'foxy-builder'),
                'tab' => self::$TAB_SITE_IDENTITY,
            ]
        );
        
        $this->add_responsive_control(
            'identity.url',
            [
                'label'   => __('URL', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.title',
            [
                'label'   => __('Site Title', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('My Website Name', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.description',
            [
                'label'   => __('Site Description', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.favicon',
            [
                'label'   => __('Site Icon', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->end_controls_section();


        $this->start_controls_section(
            'address',
            [
                'label' => __('Address', 'foxy-builder'),
                'tab' => self::$TAB_SITE_IDENTITY,
            ]
        );
        
        $this->add_control(
            'identity.full_name',
            [
                'label'   => __('Full Name', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.address',
            [
                'label'   => __('Street Address', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.city',
            [
                'label'   => __('City', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.state',
            [
                'label'   => __('State', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.postal_code',
            [
                'label'   => __('Postal Code', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.country',
            [
                'label'   => __('Country', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->end_controls_section();


        $this->start_controls_section(
            'colors',
            [
                'label' => __('Global Colors', 'foxy-builder'),
                'tab' => self::$TAB_COLORS,
            ]
        );

        for ($i = 1; $i <= 10; $i++)
        {
            switch ($i)
            {
                case 1:  $name = __('Primary', 'foxy-builder'); break;
                case 2:  $name = __('Secondary', 'foxy-builder'); break;
                case 3:  $name = __('Text', 'foxy-builder'); break;
                case 4:  $name = __('Accent', 'foxy-builder'); break;
                default: $name = __('Color #', 'foxy-builder') . (string)$i; break;
            }

            $this->add_control(
                "colors_name_{$i}",
                [
                    'label'   => __('Name', 'foxy-builder'),
                    'type'    => ControlType::$TEXT,
                    'default' => $name,
                ]
            );
            
            $this->add_control(
                "colors_global_{$i}",
                [
                    'label' => __('Color', 'foxy-builder'),
                    'type' => ControlType::$COLOR,
                    'is_global' => true,
                    'default' => '#808080',
                    'selectors' => [
                        'body' => "--foxybdr-global-color-{$i}: {{VALUE}}",
                    ],
                    'separator' => $i < 10 ? 'after' : 'none',
                ]
            );
        }
        
        $this->end_controls_section();


        $this->start_controls_section(
            'fonts',
            [
                'label' => __('Global Fonts', 'foxy-builder'),
                'tab' => self::$TAB_FONTS,
            ]
        );

        for ($i = 1; $i <= 10; $i++)
        {
            switch ($i)
            {
                case 1:  $name = __('Primary', 'foxy-builder'); break;
                case 2:  $name = __('Secondary', 'foxy-builder'); break;
                default: $name = __('Font #', 'foxy-builder') . (string)$i; break;
            }

            $this->add_control(
                "fonts_name_{$i}",
                [
                    'label'   => __('Name', 'foxy-builder'),
                    'type'    => ControlType::$TEXT,
                    'default' => $name,
                ]
            );
            
            $this->add_control(
                "fonts_global_{$i}",
                [
                    'label' => __('Font', 'foxy-builder'),
                    'type' => ControlType::$FONT,
                    'is_global' => true,
                    'default' => [
                        'group' => 'system',
                        'id' => 'Arial',
                        'value' => 'Arial',
                    ],
                    'selectors' => [
                        'body' => "--foxybdr-global-font-{$i}: {{VALUE}}",
                    ],
                    'separator' => $i < 10 ? 'after' : 'none',
                ]
            );
        }
        
        $this->end_controls_section();


        $this->start_controls_section(
            'defaultstyles',
            [
                'label' => __('Default Styles', 'foxy-builder'),
                'tab' => self::$TAB_DEFAULT_STYLES,
            ]
        );
        
        $this->add_control(
            'defaultstyles_min_height',
            [
                'label'   => __('Min Height', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'default' => 0,
            ]
        );
        
        $this->end_controls_section();


        $this->start_controls_section(
            'breakpoints',
            [
                'label' => __('Breakpoints', 'foxy-builder'),
                'tab' => self::$TAB_BREAKPOINTS,
            ]
        );

        $this->add_control(
            'breakpoints_tablet',
            [
                'label'   => __('Tablet', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'default' => 1024,
            ]
        );

        $this->add_control(
            'breakpoints_mobile',
            [
                'label'   => __('Mobile', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'default' => 767,
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
