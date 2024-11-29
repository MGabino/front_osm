<?php
//require_once 'config.php';

function calculateTotalDistance($points) {
    // Construir la URL para la solicitud a OSRM
    $coordinates = implode(';', array_map(function($point) {
        return $point[1] . ',' . $point[0]; // Invertir latitud y longitud para OSRM
    }, $points));
    //$url = OSRM_SERVER . '/route/v1/driving/' . $coordinates . '?overview=full';
    

    // Realizar la solicitud a OSRM
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);  


    // Procesar la respuesta de OSRM
    $data = json_decode($response, true);
    return $data['routes'][0]['distance'];
}

// Ejemplo de uso (reemplazar con la lógica de tu controlador)
$data = json_decode(file_get_contents('php://input'), true);
$points = $data['points'];

$totalDistance = calculateTotalDistance($points);

// Obtener las coordenadas de la ruta
$coordinates = $data['routes'][0]['geometry']['coordinates'];

// Devolver la distancia total y las coordenadas de la ruta
echo json_encode([
    'totalDistance' => $totalDistance,
    'routeCoordinates' => $coordinates
]);