<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-type: text/json');


if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ',
                    '-',
                    ucwords(strtolower(str_replace('_', ' ', substr($name, 5))))
                )] = $value;
            }
        }
        return $headers;
    }
}
$header = getallheaders();

// 这里写死前端三个字段

if (isset($_FILES['music']) || isset($_FILES['music2']) || isset($_FILES['music3'])) {
    if (isset($_FILES['music'])) {
        $field = 'music';
    }
    if (isset($_FILES['music2'])) {
        $field = 'music2';
    }
    if (isset($_FILES['music3'])) {
        $field = 'music3';
    }

    $uploaded_tmp = $_FILES[$field]['tmp_name'];

    // 创建该切片储存文件夹
    $path = "./upload/" . $header['upload-file-id'];
    if (!file_exists($path)) {
        mkdir($path);
    }

    $filename = $_FILES[$field]['name'];

    $suffix = substr($filename, strrpos($filename, "."));

    // 新的文件名称
    $file = $path . "/" .
        $header['upload-now-order'] . '-' . $header['upload-size-range']
        . $suffix;
    if (move_uploaded_file($uploaded_tmp, $file) && true) {

        // 可以选择每次进行文件追加或者全部完成之后进行合并

        if ($header['upload-total-slice'] === $header['upload-now-order']) {
            // 最后一块切片上传完成
            header('HTTP/1.1 200 ok');
            $files = scandir($path);
            // 合并文件
            foreach ($files as $item) {
                if (!in_array($item, ['.', '..'])) {
                    file_put_contents(
                        $path . '/' . $header['upload-file-id'] . $suffix,
                        file_get_contents($path . '/' . $item),
                        FILE_APPEND
                    );

                    unlink($path . '/' . $item);
                }
            }
            exit(json_encode([
                'msg' => '第' . $header['upload-now-order'] . '块上传成功' . '-全部上传完成',
                'header' => $header
            ]));

        } else {

            header('HTTP/1.1 206 next');
            exit(json_encode([
                'msg' => '第' . $header['upload-now-order'] . '块上传成功',
                'header' => $header
            ]));

        }
    } else {
        // 返回非 200 206 前端会重新上传
        header('HTTP/1.1 510 error');
        echo json_encode([
            'msg' => '第' . $header['upload-now-order'] . '块上传失败',
            'header' => $header
        ]);
    }
} else if (isset($header['upload-file-md5'])) {
    // 在这里进行MD5校验

    $md5Data = json_decode($_POST['upload-file-md5'], true);

    foreach ($md5Data as &$item) {
        $path = "./upload/" . $item['upload-file-id'] . '/' . $item['upload-file-id'] . '.' . $item['suffix'];
        $phpMd5 = md5_file($path);
        if ($phpMd5 === $item['md5']) {

            $item['status'] = 1;
        } else {

            $item['status'] = 0;
        }
        $item['phpMd5'] = $phpMd5;

    }
    echo json_encode([
        'res' => $md5Data,
        'header' => $header
    ]);
}