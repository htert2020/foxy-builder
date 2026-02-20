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
							<div id="foxybdr-widgets-button"><span class="dashicons dashicons-plus"></span></div>
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
					<div class="foxybdr-header">
						<div class="foxybdr-pin-button">
							<span class="dashicons dashicons-admin-post"></span>
						</div>
					</div>
					<div class="foxybdr-tabs"></div>
					<div class="foxybdr-tab-body"></div>
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

	<script id="foxybdr-tmpl-settings-layout-tabs" type="text/html">
		<div class="foxybdr-settings-layout-tabs">
			<div class="foxybdr--tabs"></div>
			<div class="foxybdr--tab--body"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-settings-layout-popover" type="text/html">
		<div class="foxybdr-control">
			<div class="foxybdr-control-prompt">
				<div>
					<div class="foxybdr-control-label"></div>
				</div>
				<div></div>
			</div>
			<div class="foxybdr-control-input">
				<div class="foxybdr-input-group-with-dropdown">
					<div class="foxybdr-group-button">
						<span class="dashicons dashicons-edit"></span>
						<div class="foxybdr-group-dropdown foxybdr-control-dropdown">
							<div class="foxybdr-title-bar">
								<div>
									<span class="foxybdr-title"></span>
								</div>
								<div>
									<span class="dashicons dashicons-trash"></span>
								</div>
							</div>
							<div class="foxybdr-body foxybdr-control-wrapper">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-widgets-module" type="text/html">
		<div class="foxybdr-widgets-module">
			<div class="foxybdr-tabs">
				<div class="foxybdr-tab" foxybdr-name="widgets">Widgets</div>
				<div class="foxybdr-tab" foxybdr-name="components">Components</div>
			</div>
			<div class="foxybdr--tab--body">
				<div class="foxybdr-tab-page" foxybdr-name="widgets">
					<div class="foxybdr-header"></div>
					<div class="foxybdr-body"></div>
				</div>
				<div class="foxybdr-tab-page" foxybdr-name="components">
					<div class="foxybdr-header"></div>
					<div class="foxybdr-body">
						<div class="foxybdr-empty-message">
							<span>No components found.</span>
						</div>
						<div class="foxybdr-component-container"></div>
					</div>
				</div>
			</div>
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

	<script id="foxybdr-tmpl-drawer-template" type="text/html">
		<div class="foxybdr-tab-page">
			<div class="foxybdr-empty-message">
				<span>Document is empty.</span>
			</div>
			<div class="foxybdr-tree-container"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-drawer-components" type="text/html">
		<div class="foxybdr-tab-page">
			<div class="foxybdr-empty-message">
				<span>No components found.</span>
			</div>
			<div class="foxybdr-tree-container"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-tree-item" type="text/html">
		<div class="foxybdr-tree-item">
			<div class="foxybdr-header">
				<div class="foxybdr-expander">
					<span class="dashicons dashicons-arrow-right-alt2"></span>
					<span class="dashicons dashicons-arrow-down-alt2"></span>
				</div>
				<div class="foxybdr-card">
					<span class="foxybdr-title"></span>
				</div>
			</div>
			<div class="foxybdr-dropdown">
				<div class="foxybdr-spacer"></div>
				<div class="foxybdr-container"></div>
			</div>
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
					<div class="foxybdr-control-label"></div>
					<div class="foxybdr-responsive-button">
						<span class="dashicons dashicons-desktop"></span>
						<div class="foxybdr-responsive-dropdown">
							<span class="dashicons dashicons-desktop"></span>
							<span class="dashicons dashicons-tablet"></span>
							<span class="dashicons dashicons-smartphone"></span>
						</div>
					</div>
				</div>
				<div>
					<select class="foxybdr-unit-select"></select>
				</div>
			</div>
			<div class="foxybdr-control-input"></div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-text" type="text/html">
		<input type="text" class="foxybdr-input-text" value="" />
	</script>

	<script id="foxybdr-tmpl-input-textarea" type="text/html">
		<textarea class="foxybdr-input-textarea"></textarea>
	</script>

	<script id="foxybdr-tmpl-input-wysiwyg" type="text/html">
		<textarea class="foxybdr-input-wysiwyg"></textarea>
	</script>

	<script id="foxybdr-tmpl-input-select" type="text/html">
		<select class="foxybdr-input-select"></select>
	</script>

	<script id="foxybdr-tmpl-input-choose" type="text/html">
		<div class="foxybdr-input-choose"></div>
	</script>

	<script id="foxybdr-tmpl-input-switcher" type="text/html">
		<div class="foxybdr-input-switcher">
			<div class="foxybdr-track">
				<div class="foxybdr-label">
					<span></span>
				</div>
				<div class="foxybdr-label">
					<span></span>
				</div>
				<div class="foxybdr-handle"></div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-number" type="text/html">
		<input type="number" class="foxybdr-input-number" value="" />
	</script>

	<script id="foxybdr-tmpl-input-slider" type="text/html">
		<div class="foxybdr-input-slider">
			<div>
				<div class="foxybdr-track">
					<div class="foxybdr-handle"></div>
				</div>
			</div>
			<div>
				<input type="number" value="" />
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-dimensions" type="text/html">
		<div class="foxybdr-input-dimensions">
			<div>
				<div class="foxybdr-lock-button">
					<span class="dashicons dashicons-lock"></span>
					<span class="dashicons dashicons-unlock"></span>
				</div>
				<input type="number" class="foxybdr-left" value="" />
				<input type="number" class="foxybdr-top" value="" />
				<input type="number" class="foxybdr-right" value="" />
				<input type="number" class="foxybdr-bottom" value="" />
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-url" type="text/html">
		<input type="url" class="foxybdr-input-url" value="" />
	</script>

	<script id="foxybdr-tmpl-input-color" type="text/html">
		<div class="foxybdr-input-color">
			<div class="foxybdr-global-button">
				<span class="dashicons dashicons-admin-site-alt3"></span>
				<div class="foxybdr-global-dropdown foxybdr-control-dropdown">
					<div class="foxybdr-title-bar">
						<div>
							<span class="foxybdr-title">Global Colors</span>
						</div>
						<div>
							<span class="dashicons dashicons-admin-generic"></span>
							<span class="dashicons dashicons-trash"></span>
						</div>
					</div>
					<div class="foxybdr-body">
					</div>
				</div>
			</div>
			<div class="foxybdr-color-button">
				<img src="<?php echo esc_attr(FOXYBUILDER_PLUGIN_URL . 'admin/assets/images/control_color_button.png'); ?>" />
				<div class="foxybdr-custom-dropdown foxybdr-control-dropdown">
					<div class="foxybdr-title-bar">
						<div>
							<span class="foxybdr-title">Color Picker</span>
						</div>
						<div>
							<span class="dashicons dashicons-trash"></span>
						</div>
					</div>
					<div class="foxybdr-body">
						<div class="foxybdr-color-picker-container"></div>
					</div>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-color-picker" type="text/html">
		<div class="foxybdr-input-color-picker">
			<div class="foxybdr-main-track">
				<div class="foxybdr-handle"></div>
			</div>
			<div class="foxybdr-hue-track">
				<div class="foxybdr-handle"></div>
			</div>
			<div class="foxybdr-opacity-track">
				<div class="foxybdr-handle"></div>
			</div>
			<div class="foxybdr-code-container">
				<input type="text" value="" />
				<div class="foxybdr-code-buttons">
					<span foxybdr-name="foxybdr-hexa" class="foxybdr-selected">HEXA</span>
					<span foxybdr-name="foxybdr-rgba">RGBA</span>
					<span foxybdr-name="foxybdr-hsla">HSLA</span>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-color-global-row" type="text/html">
		<div class="foxybdr-input-color-global-row" foxybdr-id="">
			<div>
				<div></div>
			</div>
			<div>
				<span></span>
			</div>
			<div>
				<span class="dashicons dashicons-yes"></span>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-media" type="text/html">
		<div class="foxybdr-input-media">
			<span class="dashicons dashicons-insert"></span>
			<span class="dashicons dashicons-trash"></span>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-font" type="text/html">
		<div class="foxybdr-input-font">
			<div class="foxybdr-global-button">
				<span class="dashicons dashicons-admin-site-alt3"></span>
				<div class="foxybdr-global-dropdown foxybdr-control-dropdown">
					<div class="foxybdr-title-bar">
						<div>
							<span class="foxybdr-title">Global Fonts</span>
						</div>
						<div>
							<span class="dashicons dashicons-admin-generic"></span>
							<span class="dashicons dashicons-trash"></span>
						</div>
					</div>
					<div class="foxybdr-body">
					</div>
				</div>
			</div>
			<div class="foxybdr-font-button">
				<span class="foxybdr-font-name"></span>
				<div class="foxybdr-custom-dropdown foxybdr-control-dropdown">
					<div class="foxybdr-title-bar">
						<div>
							<span class="foxybdr-title">Font Picker</span>
						</div>
						<div>
							<span class="dashicons dashicons-trash"></span>
						</div>
					</div>
					<div class="foxybdr-body">
					</div>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-font-picker" type="text/html">
		<div class="foxybdr-input-font-picker">
			<div class="foxybdr-search-bar">
				<input type="text" />
			</div>
			<div class="foxybdr-font-list">
			</div>
			<div class="foxybdr-empty-message foxybdr-hide">No fonts found.</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-font-global-row" type="text/html">
		<div class="foxybdr-input-font-global-row">
			<div>
				<div class="foxybdr-name"></div>
				<div class="foxybdr-font"></div>
			</div>
			<div>
				<span class="dashicons dashicons-yes"></span>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-icons" type="text/html">
		<div class="foxybdr-input-icons">
			<i class=""></i>
			<span class="dashicons dashicons-insert"></span>
			<span class="dashicons dashicons-trash"></span>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-icons-dialog" type="text/html">
		<div class="foxybdr-input-icons-dlg">
			<div class="foxybdr-dlg-box">
				<div class="foxybdr-header">
					<span class="foxybdr-title">Select Icon</span>
					<span class="dashicons dashicons-no"></span>
				</div>
				<div class="foxybdr-body">
					<div class="foxybdr-side-panel">
						<div></div>
					</div>
					<div class="foxybdr-main-panel">
						<div class="foxybdr-search-bar">
							<input type="text" placeholder="Search..." />
						</div>
						<div class="foxybdr-icon-list">
							<div class="foxybdr-grid"></div>
						</div>
						<div class="foxybdr-empty-message foxybdr-hide">No icons found.</div>
					</div>
				</div>
				<div class="foxybdr-footer">
					<button class="foxybdr-select-button">Select</button>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-group-inline" type="text/html">
		<div class="foxybdr-input-group-inline foxybdr-control-wrapper">
		</div>
	</script>

	<script id="foxybdr-tmpl-input-group-with-dropdown" type="text/html">
		<div class="foxybdr-input-group-with-dropdown">
			<div class="foxybdr-group-button">
				<span class="dashicons dashicons-edit"></span>
				<div class="foxybdr-group-dropdown foxybdr-control-dropdown">
					<div class="foxybdr-title-bar">
						<div>
							<span class="foxybdr-title"></span>
						</div>
						<div>
							<span class="dashicons dashicons-trash"></span>
						</div>
					</div>
					<div class="foxybdr-body foxybdr-control-wrapper">
					</div>
				</div>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-repeater" type="text/html">
		<div class="foxybdr-input-repeater">
			<div class="foxybdr-item-container"></div>
			<div class="foxybdr-add-button">
				<span class="dashicons dashicons-insert"></span>
				<span>Add Item</span>
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-repeater-item" type="text/html">
		<div class="foxybdr-input-repeater-item">
			<div class="foxybdr-header">
				<div class="foxybdr-label" draggable="true">
					<span>Item</span>
				</div>
				<div class="foxybdr-duplicate-button">
					<span class="dashicons dashicons-insert"></span>
				</div>
				<div class="foxybdr-delete-button">
					<span class="dashicons dashicons-trash"></span>
				</div>
			</div>
			<div class="foxybdr-body">
			</div>
		</div>
	</script>

	<script id="foxybdr-tmpl-input-heading" type="text/html">
		<div class="foxybdr-input-heading"></div>
	</script>

<?php

	wp_footer();

	do_action( 'admin_print_footer_scripts' );

?>

</body>
</html>
