<?php

namespace FoxyBuilder\Admin\Includes\Table;

if (!defined('ABSPATH'))
    exit;

class ColumnDefinition
{
    public $title;

    public $attribute_name;

    public $is_attribute_meta;

    public $width;

    public $text_align;

    public function __construct($title, $attribute_name, $is_attribute_meta, $width, $text_align)
    {
        $this->title = $title;
        $this->attribute_name = $attribute_name;
        $this->is_attribute_meta = $is_attribute_meta;
        $this->width = $width;
        $this->text_align = $text_align;
    }
}

class Table
{
    private $post_type;

    private $column_definitions = [];

    private $search_filter = [];

    private $page_size = 20;

    private $sortable_field_names = [ 'ID', 'author', 'title', 'name', 'type', 'date', 'modified', 'comment_count' ];

    private $post_attribute_names = [
        "ID"        => "ID",
        "title"     => "post_title",
        "name"      => "post_name",
        "author"    => "post_author",
        "date"      => "post_date",
        "modified"  => "post_modified",
        "status"    => "post_status",
        "type"      => "post_type",
        "mime_type" => "post_mime_type",
    ];

    /**
     * @param string       $post_type         The post type of the objects to be displayed in the table.
     */
    public function __construct($post_type)
    {
        $this->post_type = $post_type;
    }

    /**
     * @param string    $title                   The displayable friendly name of the column.
     * @param string    $attribute_name          The name of the post attribute: "ID", "title", "name", "author", "date", "modified", "status", "type", "mime_type",
     *                                           or meta key name (e.g. "_foxybdr_version").
     * @param bool      $is_attribute_meta       Whether or not the specified attribute name is the name of a post meta_key.
     * @param float     $width                   A relative width for the column. This width will be divided by the sum of all the other column widths to get a final
     *                                           percentage width for the column.
     * @param string    $text_align              Horizontal text alignment of the content displayed in the table cell: left, center, right.
    */
    public function add_column($title, $attribute_name, $is_attribute_meta, $width, $text_align)
    {
        $this->column_definitions[] = new ColumnDefinition($title, $attribute_name, $is_attribute_meta, $width, $text_align);
    }

    /**
     * Sets the search filter for the query into the database to fetch the objects to be displayed in the table.
     * 
     * @param array     $params                  These are the same parameters used in the constructor of the WordPress class WP_Query.
     */
    public function set_search_filter($params)
    {
        $this->search_filter = $params;
    }

    /**
     * @param int       $page_size               The maximum number of items per page shown in the table results.
     */
    public function set_page_size($page_size)
    {
        $this->page_size = $page_size;
    }

    public function print_output_html()
    {
        $page_number = isset($_GET['foxybdr_page_num']) ? (int)\FoxyBuilder\Includes\Security::sanitize_request($_GET, 'foxybdr_page_num') : 1;
        $offset = ($page_number - 1) * $this->page_size;

        $sort_field = null;
        if (isset($_GET['foxybdr_sort_field']))
        {
            $sort_field = \FoxyBuilder\Includes\Security::sanitize_request($_GET, 'foxybdr_sort_field');

            if (!in_array($sort_field, $this->sortable_field_names, true))
                $sort_field = null;
        }

        $sort_direction = isset($_GET['foxybdr_sort_dir']) ? \FoxyBuilder\Includes\Security::sanitize_request($_GET, 'foxybdr_sort_dir') : 'ASC';
        $sort_direction = strtoupper($sort_direction);
        if (!in_array($sort_direction, [ 'ASC', 'DESC' ], true))
            $sort_direction = 'ASC';

        $query_params = [
            'post_type' => $this->post_type,
            'posts_per_page' => $this->page_size,
            'offset' => $offset,
        ];

        if ($sort_field !== null)
        {
            $query_params['orderby'] = $sort_field;
            $query_params['order'] = $sort_direction;
        }

        $query_params = array_merge($this->search_filter, $query_params);

        $wp_query = new \WP_Query($query_params);

        $max_page_number = $wp_query->max_num_pages;
        if ($max_page_number <= 0)
            $max_page_number = 1;

        // Is the page number specified in the URL params too high?
        if ($page_number > $max_page_number)
        {
            // Setting offset to zero forces WP_Query to return an accurate max_num_pages.
            $query_params['offset'] = 0;
            $wp_query = new \WP_Query($query_params);

            $max_page_number = $wp_query->max_num_pages;
            if ($max_page_number <= 0)
                $max_page_number = 1;
    
            $page_number = $max_page_number;
            $offset = ($page_number - 1) * $this->page_size;
            $query_params['offset'] = $offset;
            $wp_query = new \WP_Query($query_params);
        }
        
        if ($wp_query->post_count > 0)
        {
            ?><div class="foxybdr-control-panel"><?php

                $this->print_paging_html($page_number, $max_page_number);

            ?></div><?php
            ?><table class="foxybdr-admin-includes-table"><?php
                ?><colgroup><?php

                    $total_width = 0.0;
                    foreach ($this->column_definitions as $column_definition)
                        $total_width += $column_definition->width;
        
                    foreach ($this->column_definitions as $column_definition)
                    {
                        $width_percent = $total_width > 0.0 ? $column_definition->width / $total_width * 100.0 : 0.0;
                        ?><col style="width: <?php echo esc_attr($width_percent); ?>%;" /><?php
                    }

                ?></colgroup><?php
                ?><thead><?php
                    ?><tr><?php

                        foreach ($this->column_definitions as $column_definition)
                        {
                            $classList = [];
                            if (!$column_definition->is_attribute_meta && in_array($column_definition->attribute_name, $this->sortable_field_names))
                            {
                                $classList[] = 'foxybdr-sortable';
                                if ($sort_field === $column_definition->attribute_name)
                                {
                                    $classList[] = $sort_direction === 'ASC' ? 'foxybdr-sort-asc' : 'foxybdr-sort-desc';
                                }
                            }

                            $link_url = null;
                            if (in_array('foxybdr-sortable', $classList))
                            {
                                $url_params = $this->clone_url_params();

                                if (!in_array('foxybdr-sort-asc', $classList) && !in_array('foxybdr-sort-desc', $classList))
                                {
                                    $url_params['foxybdr_sort_field'] = $column_definition->attribute_name;
                                    $url_params['foxybdr_sort_dir'] = 'asc';
                                }
                                elseif (in_array('foxybdr-sort-asc', $classList))
                                {
                                    $url_params['foxybdr_sort_field'] = $column_definition->attribute_name;
                                    $url_params['foxybdr_sort_dir'] = 'desc';
                                }
                                elseif (in_array('foxybdr-sort-desc', $classList))
                                {
                                    if (isset($url_params['foxybdr_sort_field']))
                                        unset($url_params['foxybdr_sort_field']);
                                    if (isset($url_params['foxybdr_sort_dir']))
                                        unset($url_params['foxybdr_sort_dir']);
                                }

                                $link_url = $this->build_url_from_params($url_params);
                            }

                            $classList[] = "foxybdr-talign-" . $column_definition->text_align;

                            ?><th class="<?php echo esc_attr(implode(' ', $classList)); ?>" foxybdr-field-name="<?php echo esc_attr($column_definition->attribute_name); ?>"><?php

                                if ($link_url !== null)
                                {
                                    $hint = __('Click to order rows by', 'foxy-builder') . ' ' . $column_definition->title;
                                    ?><a href="<?php echo esc_url($link_url); ?>" title="<?php echo esc_attr($hint); ?>"><?php
                                }

                                        ?><span><?php echo esc_html($column_definition->title); ?></span><?php
                                        ?><span class="dashicons dashicons-arrow-up"></span><?php
                                        ?><span class="dashicons dashicons-arrow-down"></span><?php

                                if ($link_url !== null)
                                {
                                    ?></a><?php
                                }

                            ?></th><?php
                        }

                    ?></tr><?php
                ?></thead><?php
                ?><tbody><?php

                    foreach ($wp_query->posts as $post)
                    {
                        ?><tr foxybdr-post-id="<?php echo esc_attr($post->ID); ?>" foxybdr-post-title="<?php echo esc_attr($post->post_title); ?>"><?php

                            for ($i = 0; $i < count($this->column_definitions); $i++)
                            {
                                $column_definition = $this->column_definitions[$i];

                                $classList = [ "foxybdr-talign-" . $column_definition->text_align ];

                                ?><td class="<?php echo esc_attr(implode(' ', $classList)); ?>"><?php

                                    if ($column_definition->is_attribute_meta)
                                    {
                                        $value = $post->__get($column_definition->attribute_name);
                                    }
                                    else
                                    {
                                        $property = $this->post_attribute_names[$column_definition->attribute_name];
                                        $value = $post->$property;
                                    }

                                    $this->on_print_cell($value, $post, $column_definition);

                                    if ($i === 0)
                                        $this->print_row_actions($post);

                                ?></td><?php
                            }

                        ?></tr><?php
                    }

                ?></tbody><?php
            ?></table><?php
            ?><div class="foxybdr-control-panel"><?php

                $this->print_paging_html($page_number, $max_page_number);

            ?></div><?php

            $url_params = $this->clone_url_params();
            $_url_params = json_encode($url_params);
            $base_url = $_SERVER['PHP_SELF'];

            ?><input type="hidden" name="foxybdr-url-params" value="<?php echo esc_attr($_url_params); ?>" /><?php
            ?><input type="hidden" name="foxybdr-base-url" value="<?php echo esc_url($base_url); ?>" /><?php
        }
        else
        {
            $this->on_print_empty_results();
        }
    }

    protected function on_print_empty_results()
    {
        ?>

            No results found.

        <?php
    }

    protected function on_print_cell($value, $post, $column_definition)
    {
        if ($column_definition->is_attribute_meta === false && $column_definition->attribute_name === 'title')
        {
            $edit_url = $this->post_edit_url($post);

            ?><a class="foxybdr-post-title" href="<?php echo esc_url($edit_url); ?>"><?php echo esc_html($value); ?></a><?php
        }
        else
        {
            ?><span><?php echo esc_html($value); ?></span><?php
        }
    }

    protected function on_post_actions($actions, $post)
    {
        return $actions;
    }

    protected function post_edit_url($post)
    {
        return $_SERVER['PHP_SELF'];
    }

    private function print_row_actions($post)
    {
        $edit_url = $this->post_edit_url($post);

        $actions = [
            [
                'action' => 'edit',
                'label' => __('Edit', 'foxy-builder'),
                'url' => $edit_url,
            ],
            [
                'action' => 'delete',
                'label' => __('Delete', 'foxy-builder'),
                'url' => null,
            ],
        ];

        $actions = $this->on_post_actions($actions, $post);

        ?><div class="foxybdr-row-actions"><?php

            for ($i = 0; $i < count($actions); $i++)
            {
                $action = $actions[$i];

                if ($action['url'] !== null)
                {
                    ?><a class="foxybdr-link" foxybdr-action="<?php echo esc_attr($action['action']); ?>" href="<?php echo esc_url($action['url']); ?>"><?php
                        echo esc_html($action['label']);
                    ?></a><?php
                }
                else
                {
                    ?><span class="foxybdr-link" foxybdr-action="<?php echo esc_attr($action['action']); ?>"><?php echo esc_html($action['label']); ?></span><?php
                }

                if ($i < count($actions) - 1)
                {
                    ?> | <?php
                }
            }

        ?></div><?php
    }

    private function print_paging_html($page_number, $max_page_number)
    {
        if ($max_page_number <= 1)
            return;
        
        ?><span><?php

            $url_params = null;

            if ($page_number >= 2)
            {
                $url_params = $this->clone_url_params();

                $url_params['foxybdr_page_num'] = '1';
                $link_url_first = $this->build_url_from_params($url_params);

                $url_params['foxybdr_page_num'] = (string)($page_number - 1);
                $link_url_previous = $this->build_url_from_params($url_params);
                
                ?><a class="foxybdr-paging-button" href="<?php echo esc_url($link_url_first); ?>"><?php
                    ?><span>«</span><?php
                ?></a> <?php
                ?><a class="foxybdr-paging-button" href="<?php echo esc_url($link_url_previous); ?>"><?php
                    ?><span>‹</span><?php
                ?></a> <?php
            }
            else
            {
                ?><span class="foxybdr-paging-button">«</span> <?php
                ?><span class="foxybdr-paging-button">‹</span> <?php
            }

            ?><span class="foxybdr-paging-page"><?php
                ?><input class="foxybdr-paging-input" type="text" value="<?php echo esc_attr($page_number); ?>" size="1"> <?php
                ?><span> <?php echo esc_html__('of', 'foxy-builder'); ?> <?php
                    ?><span class="foxybdr-paging-max"><?php echo esc_html($max_page_number); ?></span> <?php
                ?></span><?php
            ?></span><?php

            if ($page_number < $max_page_number)
            {
                if ($url_params === null)
                    $url_params = $this->clone_url_params();

                $url_params['foxybdr_page_num'] = (string)$max_page_number;
                $link_url_last = $this->build_url_from_params($url_params);

                $url_params['foxybdr_page_num'] = (string)($page_number + 1);
                $link_url_next = $this->build_url_from_params($url_params);
                
                ?><a class="foxybdr-paging-button" href="<?php echo esc_url($link_url_next); ?>"><?php
                    ?><span>›</span><?php
                ?></a> <?php
                ?><a class="foxybdr-paging-button" href="<?php echo esc_url($link_url_last); ?>"><?php
                    ?><span>»</span><?php
                ?></a> <?php
            }
            else
            {
                ?><span class="foxybdr-paging-button">›</span> <?php
                ?><span class="foxybdr-paging-button">»</span> <?php
            }

        ?></span><?php
    }

    private function clone_url_params()
    {
        $retval = [];

        foreach ($_GET as $key => $value)
        {
            $_key = wp_kses_post_deep(wp_unslash($key));
            $_value = wp_kses_post_deep(wp_unslash($value));
            $retval[$_key] = $_value;
        }

        return $retval;
    }

    private function build_url_from_params($url_params)
    {
        $item_list = [];

        foreach ($url_params as $key => $value)
            $item_list[] = urlencode($key) . '=' . urlencode($value);

        if (count($item_list) === 0)
            return $_SERVER['PHP_SELF'];  // e.g. /wp-admin/admin.php
        else
            return $_SERVER['PHP_SELF'] . '?' . implode('&', $item_list);
    }
}
