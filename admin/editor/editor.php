<?php

namespace FoxyBuilder\Admin\Editor;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';

class Editor
{
    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    protected function __construct()
    {
    }

    public function init()
    {
        add_action('admin_action_foxy_builder', [ $this, 'action_foxy_builder' ]);
    }

    public function action_foxy_builder()
    {
		if (empty($_GET['post']))
			return;

        $post_id = absint($_GET['post']);

        $document = \FoxyBuilder\Modules\Document::get_document($post_id);

        if ($document === null || $document->can_user_edit() === false)
            return;

        if ($document->edit_mode() === false)
        {
            $document->edit_mode(true);
            $document->save();
        }

		@header('Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option('blog_charset'));

        add_filter('show_admin_bar', '__return_false');

        remove_all_actions('wp_head');
        remove_all_actions('wp_print_styles');
        remove_all_actions('wp_print_head_scripts');
        remove_all_actions('wp_footer');

        add_action('wp_head', 'wp_enqueue_scripts', 1);
        add_action('wp_head', 'wp_print_styles', 8);
        add_action('wp_head', 'wp_print_head_scripts', 9);

        remove_all_actions('wp_enqueue_scripts');

        remove_all_actions('after_wp_tiny_mce');

        add_action('wp_enqueue_scripts', [ $this, 'enqueue' ], 999999);

        require FOXYBUILDER_PLUGIN_PATH . '/admin/editor/editor-page.php';
        
        die;
    }

    public function enqueue()
    {
        global $wp_styles, $wp_scripts;

        $wp_styles = new \WP_Styles();
        $wp_scripts = new \WP_Scripts();
    
        wp_enqueue_style('foxybdr-admin-wp-common', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/wp-common.css", [], FOXYBUILDER_VERSION);
    
        wp_enqueue_style('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-page.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-controls.css", [], FOXYBUILDER_VERSION);
    
        wp_enqueue_script('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-page.js', [], FOXYBUILDER_VERSION);
        wp_localize_script('foxybdr-admin-editor-page', 'FOXYAPP', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'widget_categories' => [],
            'widgets' => [
                'foxybdr.settings.site' => [
                    'title' =>  'Site Settings',
                    'icon' =>  '',
                    'tabs' =>  [
                        [
                            'title' =>  'Site Identity',
                            'sections' =>  [
                                [
                                    'title' =>  'Website',
                                    'settings' =>  [
                                        'identity.title',
                                        'identity.description',
                                        'identity.favicon'
                                    ]
                                ],
                                [
                                    'title' =>  'Address',
                                    'settings' =>  [
                                        'identity.full_name',
                                        'identity.address',
                                        'identity.city',
                                        'identity.state',
                                        'identity.postal_code',
                                        'identity.country'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'title' =>  'Palettes',
                            'sections' =>  [
                            ]
                        ],
                        [
                            'title' =>  'Default Styles',
                            'sections' =>  [
                            ]
                        ],
                        [
                            'title' =>  'Breakpoints',
                            'sections' =>  [
                            ]
                        ],
                        [
                            'title' =>  'Global CSS',
                            'sections' =>  [
                            ]
                        ]
                    ],
                    'settings' =>  [
                        'identity.title' =>  [
                            'label'    =>  'Site Title',
                            'type'     =>  'TEXT',
                            'default'  =>  'My Website Name'
                        ],
                        'identity.description' =>  [
                            'label'    =>  'Site Description',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.favicon' =>  [
                            'label'    =>  'Site Icon',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.full_name' =>  [
                            'label'    =>  'Full Name',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.address' =>  [
                            'label'    =>  'Street Address',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.city' =>  [
                            'label'    =>  'City',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.state' =>  [
                            'label'    =>  'State',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.postal_code' =>  [
                            'label'    =>  'Postal Code',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                        'identity.country' =>  [
                            'label'    =>  'Country',
                            'type'     =>  'TEXT',
                            'default'  =>  ''
                        ],
                    ],
                ],
            ],
        ]);
        wp_enqueue_script('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-controls.js', [], FOXYBUILDER_VERSION);
    
        wp_print_scripts([ 'wp-tinymce' ]);
    
        wp_enqueue_media();
    }
}
