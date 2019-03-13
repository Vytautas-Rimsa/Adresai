<?php
/**
 * Created by PhpStorm.
 * User: Vytautas
 * Date: 2019-03-04
 * Time: 17:28
 */
$savivaldybe = $_POST['municipality'];
$miestas = $_POST['city'];
$adresas = $_POST['address'];
$zipcodas= $_POST['zipcode'];

echo "$savivaldybe, $miestas, $adresas, $zipcodas";