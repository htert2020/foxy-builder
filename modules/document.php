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
        '_foxybdr_wi_id' => null,
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

        if (in_array($post_type, [ 'post', 'page', 'foxybdr_template' ]))
        {
            $value = get_post_meta($this->post['ID'], $key, true);

            return $value;
        }

        return null;
    }

    protected function write_meta($key, $value)
    {
        $post_type = $this->post['post_type'];

        if (in_array($post_type, [ 'post', 'page', 'foxybdr_template' ]))
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

    public function post_type($newValue = null)
    {
        if ($newValue === null)
            return $this->post['post_type'];

        $this->post['post_type'] = $newValue;
    }

    public function edit_mode($newValue = null)
    {
        if ($newValue === null)
            return $this->meta['_foxybdr_edit_mode'] === 'yes';
        
        $this->meta['_foxybdr_edit_mode'] = $newValue ? 'yes' : 'no';
    }

    public function widget_instance_id_counter($newValue = null)
    {
        if ($newValue === null)
            return (int)$this->meta['_foxybdr_wi_id'];

        $this->meta['_foxybdr_wi_id'] = (string)$newValue;
    }

    public function render($as_post_content = false)
    {
        $id = $this->post['ID'];
        $post_type = $this->post['post_type'];

        $class_list = [ 'foxybdr-template' ];
        if ($as_post_content === true)
            $class_list[] = 'foxybdr-post-content';

        ob_start();

        ?><div class="<?php echo esc_attr(implode(' ', $class_list)); ?>" foxybdr-post-id="<?php echo esc_attr($id); ?>" foxybdr-post-type="<?php echo esc_attr($post_type); ?>"><?php

            $widget_instances = $this->meta['_foxybdr_widget_instances'];

            if (!empty($widget_instances))
            {
                $widget_instances = json_decode($widget_instances, true);

                foreach ($widget_instances as $widget_instance)
                {
                    // TODO: Render $widget_instance
                }
            }

        ?></div><?php

        $content = ob_get_clean();

        return $content;
    }
}
