<?php

// Arreglo transacciones
$transacciones = [];

function registrarTransaccion($descripcion, $monto) {
    global $transacciones;

    $id = count($transacciones) + 1;

    $transaccion = [
        'id' => $id,
        'descripcion' => $descripcion,
        'monto' => $monto
    ];
    
    array_push($transacciones, $transaccion);
}

function generarEstadoDeCuenta(){
    global $transacciones;
    $total = 0;
    
    foreach($transacciones as $item){
        $total += $item['monto'];
    }

    $totalConInteres = $total + ($total * 0.026);
    $cashback = $total * 0.001;
    $montoFinal = $totalConInteres - $cashback;

    $estadoDeCuenta = [
        'transacciones' => $transacciones,
        'total' => $total,
        'totalConInteres' => $totalConInteres,
        'cashback' => $cashback,
        'montoFinal' => $montoFinal
    ];

    crearArchivo($estadoDeCuenta);
}

function crearArchivo($estadoDeCuenta) {

    $txt = "Estado de Cuenta\n\n";

    foreach($estadoDeCuenta['transacciones'] as $item) {
        $txt .= "ID: " . $item['id'] . "\n";
        $txt .= "Descripción: " . $item['descripcion'] . "\n";
        $txt .= "Monto: " . number_format($item['monto'], 2) . "\n";
        $txt .= "--------------------------\n";
    }

    $txt .= "\nTotal (sin interés): " . number_format($estadoDeCuenta['total'], 2) . "\n";
    $txt .= "Total con interés (2.6%): " . number_format($estadoDeCuenta['totalConInteres'], 2) . "\n";
    $txt .= "Cashback (0.1%): " . number_format($estadoDeCuenta['cashback'], 2) . "\n";
    $txt .= "Monto final a pagar: " . number_format($estadoDeCuenta['montoFinal'], 2) . "\n";

    $archivo = fopen("estado_cuenta.txt", "w") or die("No se puede abrir el archivo");
    fwrite($archivo, $txt);
    fclose($archivo);

    echo "Estado de cuenta guardado en 'estado_cuenta.txt'";
}


// Prueba del código

registrarTransaccion("Compra en supermercado", 5000);
registrarTransaccion("Pago de luz", 10000);
registrarTransaccion("Compra en línea", 15000);
registrarTransaccion("Pago de Agua", 20000);
registrarTransaccion("Compra de ropa", 18500);
registrarTransaccion("Pago de cable/internet", 40000);
registrarTransaccion("Compra carnicería", 5000);
registrarTransaccion("Pago de teléfono", 10000);
registrarTransaccion("Uber", 2500);
registrarTransaccion("Sinpe movil", 6000);
registrarTransaccion("Ubereats", 3500);

generarEstadoDeCuenta();



