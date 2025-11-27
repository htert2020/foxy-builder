<?php

namespace FoxyBuilder\Modules\Widgets\Settings;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

class Site extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_SITE_IDENTITY = 'site-identity';

    protected static $TAB_PALETTES = 'palettes';

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
                'title' => 'Site Identity',
                'name' => self::$TAB_SITE_IDENTITY,
                'sections' => [],
            ],
            [
                'title' => 'Palettes',
                'name' => self::$TAB_PALETTES,
                'sections' => [],
            ],
            [
                'title' => 'Default Styles',
                'name' => self::$TAB_DEFAULT_STYLES,
                'sections' => [],
            ],
            [
                'title' => 'Breakpoints',
                'name' => self::$TAB_BREAKPOINTS,
                'sections' => [],
            ],
            [
                'title' => 'Global CSS',
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
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.title',
            [
                'label'   => __('Site Title', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('My Website Name', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.description',
            [
                'label'   => __('Site Description', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.favicon',
            [
                'label'   => __('Site Icon', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
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
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.address',
            [
                'label'   => __('Street Address', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.city',
            [
                'label'   => __('City', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.state',
            [
                'label'   => __('State', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.postal_code',
            [
                'label'   => __('Postal Code', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->add_control(
            'identity.country',
            [
                'label'   => __('Country', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('', 'foxy-builder'),
            ]
        );
        
        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
