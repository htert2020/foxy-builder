<?php

namespace FoxyBuilder\Admin\Editor;

if (!defined('ABSPATH'))
    exit;

class ThePage
{
	public $post_id = -1;

	public $preview_url = '';

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function init()
    {
		if (empty($_GET['post']))
			return;

        $this->post_id = absint($_GET['post']);

		$preview_url = get_permalink($this->post_id);
		$url_parts = parse_url($preview_url);

		$query = isset($url_parts['query']) ? $url_parts['query'] : null;
		if ($query)
			$query .= "&foxybdr_preview={$this->post_id}";
		else
			$query  =  "foxybdr_preview={$this->post_id}";

		$this->preview_url = $url_parts['scheme'] . '://' . $url_parts['host'] . (isset($url_parts['port']) && $url_parts['port'] != 80 ? ':' . (string)$url_parts['port'] : '') . $url_parts['path'] . '?' . $query;
    }
}

ThePage::instance()->init();

?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Foxy Builder</title>
	<?php wp_head(); ?>
</head>
<body>

	<div id="foxybdr-editor-screen">
		<div id="foxybdr-editor-toolbar" class="foxybdr-general-box">
			<div id="foxybdr-toolbar-left">
				<div id="foxybdr-toolbar-btn-site-settings"><span class="dashicons dashicons-admin-site-alt3"></span></div>
				<div id="foxybdr-toolbar-btn-template-settings"><span class="dashicons dashicons-admin-page"></span></div>
				<div id="foxybdr-toolbar-btn-undo-settings"><span class="dashicons dashicons-undo"></span></div>
				<div id="foxybdr-toolbar-btn-preview"><span class="dashicons dashicons-visibility"></span></div>
			</div>
			<div id="foxybdr-toolbar-center">
				<div class="foxybdr-device-btn foxybdr-device-desktop">
					<span class="dashicons dashicons-desktop"></span>
				</div>
				<div class="foxybdr-device-btn foxybdr-device-tablet">
					<span class="dashicons dashicons-tablet"></span>
				</div>
				<div class="foxybdr-device-btn foxybdr-device-mobile">
					<span class="dashicons dashicons-smartphone"></span>
				</div>
			</div>
			<div id="foxybdr-toolbar-right">
				<button id="foxybdr-save-button">
					<span><?php echo esc_html__('Save', 'foxy-builder'); ?></span>
				</button>
			</div>
		</div>
		<div id="foxybdr-editor-body">
			<div id="foxybdr-panel-and-canvas">
				<div id="foxybdr-panel-resizable-backplate">
					<div id="foxybdr-panel">
						<div id="foxybdr-panel-header" class="foxybdr-general-box">
							<div id="foxybdr-panel-title"><span></span></div>
							<div id="foxybdr-widgets-button"><span class="dashicons dashicons-screenoptions"></span></div>
						</div>
						<div id="foxybdr-panel-body" class="foxybdr-general-box">

						</div>
					</div>
					<div id="foxybdr-panel-resizer"></div>
					<div id="foxybdr-panel-resizer-button"><span class="dashicons dashicons-arrow-left"></span></div>
				</div>
				<div id="foxybdr-canvas-backplate">
					<div id="foxybdr-preview-wrapper">
						<iframe id="foxybdr-preview-iframe" src="<?php echo esc_url(ThePage::instance()->preview_url); ?>"></iframe>
						<div class="foxybdr-iframe-cover"></div>
					</div>
				</div>
			</div>
			<div id="foxybdr-drawer-resizable-backplate">
				<div id="foxybdr-drawer-resizer"></div>
				<div id="foxybdr-drawer-resizer-button"><span class="dashicons dashicons-arrow-right"></span></div>
				<div id="foxybdr-drawer">

				</div>
			</div>
		</div>
	</div>

	<script id="foxybdr-tmpl-settings-module" type="text/html">
		<div class="foxybdr-settings-module">
			<div class="foxybdr-tabs"></div>
			<div class="foxybdr-tab-body"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-settings-module-tab-page-section" type="text/html">
		<div class="foxybdr-tab-page-section">
			<div class="foxybdr-header">
				<span class="dashicons dashicons-arrow-right"></span>
				<span class="dashicons dashicons-arrow-down"></span>
				<span class="foxybdr-title"></span>
			</div>
			<div class="foxybdr-body">
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-widgets-module" type="text/html">
		<div class="foxybdr-widgets-module">
			<div class="foxybdr-header"></div>
			<div class="foxybdr-body"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-widgets-module-category" type="text/html">
		<div class="foxybdr-category">
			<div class="foxybdr-header">
				<span class="dashicons dashicons-arrow-right"></span>
				<span class="dashicons dashicons-arrow-down"></span>
				<span class="foxybdr-title"></span>
			</div>
			<div class="foxybdr-body">
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-widgets-module-card" type="text/html">
		<div class="foxybdr-widget-card" draggable="true">
			<i></i>
			<span></span>
		</div>
	</script>

	<script id="foxybdr-tmpl-drag-drop-insert" type="text/html">
		<div class="foxybdr-drag-drop-insert">
			<canvas></canvas>
		</div>
	</script>

	<script id="foxybdr-tmpl-control" type="text/html">
		<div class="foxybdr-control">
			<div class="foxybdr-control-prompt">
				<div>
					<span class="foxybdr-control-label"></span>
					<span></span>
				</div>
				<div>
					<span></span>
					<span></span>
				</div>
			</div>
			<div class="foxybdr-control-input"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-text" type="text/html">
		<input type="text" class="foxybdr-input-text" value="" />
	</script>

<?php

	wp_footer();

	do_action( 'admin_print_footer_scripts' );

?>

</body>
</html>
