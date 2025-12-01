<?php

namespace FoxyBuilder\Modules\Widgets;

if (!defined('ABSPATH'))
    exit;

abstract class BaseWidget
{
    abstract public function get_name();
    
    abstract public function get_title();
    
    abstract public function get_icon();
    
    abstract public function get_categories();

    abstract public function get_render_js_file_path();

    abstract protected function _register_controls();

    abstract protected function render();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BASE CLASS MEMBERS AND METHODS
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    protected static $TAB_CONTENT = 'content';

    protected static $TAB_STYLE = 'style';

    protected static $TAB_ADVANCED = 'advanced';

    protected static $CONTROL_TEXT = 'TEXT';

    protected static $CONTROL_NUMBER = 'NUMBER';

    protected $title = '';

    protected $icon = '';

    protected $tabs = [];

    protected $tab_index = -1;

    protected $section_index = -1;

    protected $settings = [];

    protected $evaluated_settings = [];

    protected $eval_mode = false;

    protected $render_js_file_path = '';

    protected $is_child_container = false;

    protected function declare_tabs()  // Overriding this method is welcome and encouraged.
    {
        $this->tabs = [
            [
                'title' => 'Content',
                'name' => self::$TAB_CONTENT,
                'sections' => [],
            ],
            [
                'title' => 'Style',
                'name' => self::$TAB_STYLE,
                'sections' => [],
            ],
            [
                'title' => 'Advanced',
                'name' => self::$TAB_ADVANCED,
                'sections' => [],
            ],
        ];
    }

    protected function is_child_container()
    {
        return false;
    }

    public function build_widget_definition()
    {
        $this->title = $this->get_title();
        $this->icon = $this->get_icon();
        $this->render_js_file_path = $this->get_render_js_file_path();
        $this->is_child_container = $this->is_child_container();

        $this->declare_tabs();
        $this->_register_controls();

        return [
            'title' => $this->title,
            'icon' => $this->icon,
            'tabs' => $this->tabs,
            'settings' => $this->settings,
            'render' => $this->render_js_file_path,
            'container' => $this->is_child_container,
        ];
    }

    public function start_controls_section($section_name, $args)
    {
        if ($this->eval_mode)
            return;

        $tab_index = -1;

        for ($i = 0; $i < count($this->tabs); $i++)
        {
            $tab = $this->tabs[$i];

            if ($tab['name'] === $args['tab'])
            {
                $tab_index = $i;
                break;
            }
        }

        if ($tab_index === -1)
            return false;

        $this->tab_index = $tab_index;

        $tab = &$this->tabs[$this->tab_index];

        $new_section = [
            'title' => $args['label'],
            'name' => $section_name,
            'settings' =>  []
        ];

        $tab['sections'][] = $new_section;

        $this->section_index = count($tab['sections']) - 1;

        return true;
    }

    public function end_controls_section()
    {
        if ($this->eval_mode)
            return;

        $this->tab_index = -1;
        $this->section_index = -1;
    }

    public function add_control($setting_name, $args)
    {
        if ($this->eval_mode)
        {
            $this->settings[$setting_name] = $args;
            return;
        }

        if ($this->tab_index === -1 || $this->section_index === -1)
            return false;

        $tab = &$this->tabs[$this->tab_index];
        $section = &$tab['sections'][$this->section_index];
        $section['settings'][] = $setting_name;

        $this->settings[$setting_name] = $args;

        return true;
    }

    public function add_responsive_control($setting_name, $args)
    {
        $this->add_control($setting_name, array_merge($args, [ 'responsive' => true ]));
    }

    public function init_render()
    {
        $this->eval_mode = true;

        $this->_register_controls();
    }

    public function render_widget_instance($widget_instance)
    {
        $this->evaluate_settings($widget_instance);

        $this->render();
    }

    protected function evaluate_settings($widget_instance)
    {
        $this->evaluated_settings = [];

    }

	final public function get_settings($setting_name = null)
    {
        if ($setting_name !== null)
            if (isset($this->evaluated_settings[$setting_name]))
                return $this->evaluated_settings[$setting_name];
            else
                return null;
        else
    		return $this->evaluated_settings;
	}
}
