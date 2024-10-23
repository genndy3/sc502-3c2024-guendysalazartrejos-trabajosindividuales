function calculate(){
    const salariobruto = parseFloat(document.getElementById("salariobruto").value);
    let cargassociales = 0;
    let impuestorenta = 0;
    let salarioneto = 0;

    let ccss = 0.1067;

    if(isNaN(salariobruto)){
        alert("Por favor, ingrese un número válido");
        return;
    }

    // calculos
    cargassociales = salariobruto * ccss
    
    switch(true){
        case (salariobruto > 929000 && salariobruto < 1363000):
            impuestorenta = (salariobruto-929000)*0.10;
            break;
        case (salariobruto > 1363000 && salariobruto < 2392000):
            impuestorenta = (salariobruto-1363000)*0.15;
            break;
        case (salariobruto > 2392000 && salariobruto < 4783000):
            impuestorenta = (salariobruto-2392000)*0.20;
            break;
        case (salariobruto > 4783000):
            impuestorenta = (salariobruto-4783000)*0.25;
            break;
    };

    salarioneto = salariobruto - (cargassociales+impuestorenta);

    document.getElementById("cargassociales").innerText = cargassociales;
    document.getElementById("impuestorenta").innerText = impuestorenta;
    document.getElementById("salarioneto").innerText = salarioneto;
}