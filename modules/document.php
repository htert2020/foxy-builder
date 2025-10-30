<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

class Document
{
    protected $post = [
        'ID' => null,
        'post_name' => null,
        'post_title' => null,
        'post_content' => null,
        'post_status' => null,
        'post_type' => null,
    ];

    protected $meta = [
        '_foxybdr_version' => null,
        '_foxybdr_edit_mode' => null,
        '_foxybdr_widget_instances' => null,
    ];

    protected function __construct($post_obj)
    {
        foreach ($this->post as $key => $value)
        {
            $this->post[$key] = $post_obj->$key;
        }

        foreach ($this->meta as $key => $value)
        {
            $this->meta[$key] = $this->read_meta($key);
        }
    }

    protected function read_meta($key)
    {
        $post_type = $this->post['post_type'];

        if ($post_type === 'foxybdr_template' || $post_type === 'page')
        {
            $value = get_post_meta($this->post['ID'], $key, true);

            return $value;
        }

        return null;
    }

    protected function write_meta($key, $value)
    {
        $post_type = $this->post['post_type'];

        if ($post_type === 'foxybdr_template' || $post_type === 'page')
        {
            update_post_meta($this->post['ID'], $key, $value !== null ? $value : '');
        }
    }

    public static function get_document($id)
    {
        $post_obj = get_post(intval($id));

        if ($post_obj === null)
            return null;

        return new Document($post_obj);
    }

    public function save()
    {
        wp_update_post($this->post);

        foreach ($this->meta as $key => $value)
            $this->write_meta($key, $value);
    }

    public function can_user_edit()
    {
        $user = wp_get_current_user();

        if ($user->ID !== 0 && $user->has_cap('edit_pages'))
        {
            return true;
        }

        return false;
    }

	public function get_edit_url()
    {
        $id = $this->post['ID'];

        return admin_url("post.php?post={$id}&action=foxy_builder");
    }

    public function edit_mode($newValue = null)
    {
        if ($newValue === null)
            return $this->meta['_foxybdr_edit_mode'] === 'yes';
        
        $this->meta['_foxybdr_edit_mode'] = $newValue ? 'yes' : 'no';
    }

    public function post_type($newValue = null)
    {
        if ($newValue === null)
            return $this->post['post_type'];

        $this->post['post_type'] = $newValue;
    }
}
