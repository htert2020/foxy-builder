<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

class AssetManager
{
    private $fonts = [];

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

        $this->fonts = [
            'system' => [
                'title' => 'System Fonts',
                'order' => 100,
                'font_list' => [
                    "Arial",
                    "Tahoma",
                    "Verdana",
                    "Helvetica",
                    "Times New Roman",
                    "Trebuchet MS",
                    "Georgia"
                ],
            ],
            'google' => [
                'title' => 'Google Fonts',
                'order' => 200,
                'font_list' => [],
            ],
        ];

        $this->icon_libraries = [
            'fa-solid' => [
                'title' => 'Font Awesome - Solid Icons',
                'css_url' => FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/solid" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION,
                'css_prefix' => 'fas fa-',
                'icons' => [],
                'icon_count' => 0,
                'order' => 100,
            ],
            'fa-regular' => [
                'title' => 'Font Awesome - Regular Icons',
                'css_url' => FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/regular" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION,
                'css_prefix' => 'far fa-',
                'icons' => [],
                'icon_count' => 0,
                'order' => 200,
            ],
            'fa-brands' => [
                'title' => 'Font Awesome - Brand Icons',
                'css_url' => FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/brands" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION,
                'css_prefix' => 'fab fa-',
                'icons' => [],
                'icon_count' => 0,
                'order' => 300,
            ],
        ];
    }

    public function get_fonts()
    {
        $other_fonts = apply_filters('foxy-builder/assets/fonts', []);

        $total_fonts = array_merge($this->fonts, $other_fonts);

        $str = file_get_contents(FOXYBUILDER_PLUGIN_PATH . '/modules/asset-google-fonts.json');
        $google_font_list = json_decode($str, true);

        $total_fonts['google']['font_list'] = $google_font_list;

        return $total_fonts;
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
            $icon_list_json = file_get_contents(FOXYBUILDER_PLUGIN_PATH . "/assets/lib/font-awesome/icons/icons-{$id}.json");
            return $icon_list_json;
        }
        else
        {
            $icon_list_json = apply_filters('foxy-builder/assets/icons/library/icons', null, $id);

            if ($icon_list_json !== null)
            {
                return $icon_list_json;
            }
            else
            {
                return '{ "icons": [] }';
            }
        }
    }

    public function get_font_awesome_css_url()
    {
        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        return FOXYBUILDER_PLUGIN_URL . "assets/lib/font-awesome/css/fontawesome" . $suffix . ".css?ver=" . FOXYBUILDER_VERSION;
    }
}
