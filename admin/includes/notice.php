<?php

namespace FoxyBuilder\Admin\Includes;

if (!defined('ABSPATH'))
    exit;

class Notice
{
    private $notices = [];

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    /**
     * @param string    $status                  Either 'OK', 'WARNING', or 'ERROR'.
     * @param string    $message                 The text message to display to the user.
     */
    public function add($status, $message)
    {
        $this->notices[] = [
            'status' => $status,
            'message' => $message,
        ];
    }

    public function print_output_html()
    {
        foreach ($this->notices as $notice)
        {
            switch ($notice['status'])
            {
                case 'OK':
                    $noticeClass = 'updated';
                    $dashIconsClass = 'dashicons-yes-alt';
                    break;

                case 'WARNING':
                    $noticeClass = 'notice-warning';
                    $dashIconsClass = 'dashicons-warning';
                    break;

                case 'ERROR':
                    $noticeClass = 'notice-error';
                    $dashIconsClass = 'dashicons-dismiss';
                    break;
            }

            ?><div class="foxybdr-notice notice <?php echo esc_attr($noticeClass); ?>"><?php
                ?><p><span class="dashicons <?php echo esc_attr($dashIconsClass); ?>"></span> <?php echo esc_html($notice['message']); ?></p><?php
            ?></div><?php
        }
    }
}
