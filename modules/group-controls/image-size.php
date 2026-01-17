<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-utils.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/base-group-control.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class ImageSize extends \FoxyBuilder\Modules\GroupControls\BaseGroupControl
{
    public function get_name()
    {
        return 'IMAGE_SIZE';
    }

    public function get_title()
    {
        return __('Image Size', 'foxy-builder');
    }

    public function get_is_dropdown()
    {
        return false;
    }
    
    protected function _register_controls()
    {
        $options = \FoxyBuilder\Modules\Controls\ControlUtils::get_image_sizes();

        $this->add_control(
            'size',
            [
                'label'   => __('Image Resolution', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => $options,
                'default' => 'full',
                'label_block' => true,
            ]
        );
    }
}
