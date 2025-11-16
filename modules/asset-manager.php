<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

class AssetManager
{
    private $font_groups = [];

    private $icon_libraries = [];

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function __construct()
    {
        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        $this->font_groups = [
            'default' => [
                'title' => 'Default',
                'order' => 100,
            ],
            'google' => [
                'title' => 'Google Fonts',
                'order' => 200,
            ],
        ];

        $this->icon_libraries = [
            'fas' => [
                'title' => 'Font Awesome - Solid Icons',
                'css_urls' => [
                    FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/fontawesome" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION,
                    FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/solid" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION,
                ],
                'css_prefix' => 'fas fa-',
                'icon_count' => 0,
                'order' => 100,
            ],
            'far' => [
                'title' => 'Font Awesome - Regular Icons',
                'css_urls' => [

                ],
                'css_prefix' => 'far fa-',
                'icon_count' => 0,
                'order' => 200,
            ],
            'fab' => [
                'title' => 'Font Awesome - Brand Icons',
                'css_urls' => [

                ],
                'css_prefix' => 'fab fa-',
                'icon_count' => 0,
                'order' => 300,
            ],
        ];
    }

    public function get_icon_libraries()
    {
        $other_libraries = apply_filters('foxy-builder/assets/icons/libraries', []);

        return array_merge($this->icon_libraries, $other_libraries);
    }

    public function get_icon_library($id)
    {
        if (isset($this->icon_libraries[$id]))
        {
            return $this->icon_libraries[$id];
        }
        else
        {
            return apply_filters('foxy-builder/assets/icons/library', null, $id);
        }
    }

    public function get_icon_library_icons($id)
    {
        if (isset($this->icon_libraries[$id]))
        {
            return [];  // TODO: Load icon names from file
        }
        else
        {
            return apply_filters('foxy-builder/assets/icons/library/icons', null, $id);
        }
    }
}
