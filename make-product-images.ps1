# images\products 폴더의 실제 파일 목록을 읽어 product-images-data.js 를 만듭니다.
# 저장소 폴더(index.html 이 있는 폴더)에서 실행하세요.
$root = Join-Path (Get-Location).Path 'images\products'
if (-not (Test-Path $root)) {
    Write-Host '[오류] images\products 폴더가 없습니다. 이 스크립트는 저장소 폴더 안에서 실행해야 합니다.'
    exit 1
}
$all   = Get-ChildItem -Path $root -Recurse -File | Sort-Object FullName
$imgs  = @($all | Where-Object { $_.Extension -match '^\.(png|jpe?g|webp|gif)$' })
$glbs  = @($all | Where-Object { $_.Extension -ieq '.glb' })
function Build-Map($list) {
    $map = [ordered]@{}
    # 1차: 파일명 그대로 (브랜드폴더/파일명, */파일명)
    foreach ($f in $list) {
        $rel   = $f.FullName.Substring($root.Length).TrimStart('\') -replace '\\', '/'
        $parts = $rel.Split('/')
        $base  = [IO.Path]::GetFileNameWithoutExtension($f.Name).ToLower()
        $path  = './images/products/' + $rel
        if ($parts.Length -ge 2) { $map[($parts[0].ToLower() + '/' + $base)] = $path }
        $map[('*/' + $base)] = $path
    }
    # 2차: 'VELO 일체형세면기', 'HCL-5505 (골드)' 처럼 뒤에 설명이 붙은 파일명은 앞의 형번만으로도 연결 (1차에서 이미 있는 이름은 건드리지 않음)
    foreach ($f in $list) {
        $rel   = $f.FullName.Substring($root.Length).TrimStart('\') -replace '\\', '/'
        $parts = $rel.Split('/')
        $base  = [IO.Path]::GetFileNameWithoutExtension($f.Name).ToLower()
        $path  = './images/products/' + $rel
        $tok   = ($base -split '[\s\(\[]')[0]
        if ($tok -and ($tok -ne $base)) {
            $kAll = '*/' + $tok
            if (-not $map.Contains($kAll)) { $map[$kAll] = $path }
            if ($parts.Length -ge 2) {
                $kBr = $parts[0].ToLower() + '/' + $tok
                if (-not $map.Contains($kBr)) { $map[$kBr] = $path }
            }
        }
    }
    return $map
}
$imgMap = Build-Map $imgs
$glbMap = Build-Map $glbs
if ($imgMap.Count -eq 0) { $imgJson = '{}' } else { $imgJson = $imgMap | ConvertTo-Json }
if ($glbMap.Count -eq 0) { $glbJson = '{}' } else { $glbJson = $glbMap | ConvertTo-Json }
$text = 'window._PRODUCT_IMAGES = ' + $imgJson + ';' + "`n" + 'window._PRODUCT_GLBS = ' + $glbJson + ';'
$out  = Join-Path (Get-Location).Path 'product-images-data.js'
[IO.File]::WriteAllText($out, $text, (New-Object System.Text.UTF8Encoding $false))
Write-Host ('제품 이미지 ' + $imgs.Count + '개, 3D 모델(glb) ' + $glbs.Count + '개를 찾았습니다.')
$imgs | Group-Object Extension | ForEach-Object { Write-Host ('  이미지 ' + $_.Name + ' : ' + $_.Count + '개') }
Write-Host '완료: product-images-data.js 파일이 만들어졌습니다.'
