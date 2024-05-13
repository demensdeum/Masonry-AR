<?php
$dir_path = __DIR__;
$dirs = glob($dir_path . '/*', GLOB_ONLYDIR);
if (count($dirs) > 0) {
    usort($dirs, function($a, $b) {
        return intval($a) - intval($b);
    });
    $largest_dir = end($dirs);
    $dirname = basename($largest_dir);
    $current_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . $_SERVER['REQUEST_URI'] . '/' . $dirname;
    $current_url = str_replace("index.php", "", $current_url);
    ?>

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Масоны-ДР (Masonry-AR)</title>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                height: 100%;
            }
            iframe {
                border: none;
                width: 100%;
                height: 100%;
                display: block;
            }
        </style>
    </head>
    <body>
        <iframe src="<?php echo $current_url; ?>" frameborder="0"></iframe>
    </body>
    </html>

    <?php
    exit;
} else {
    echo "No numeric folder in script directory!";
}