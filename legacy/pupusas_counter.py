def main():
    print("¡Bienvenido al Contador de Pupusas!")
    
    while True:
        try:
            entrada = input("¿Cuántas personas van a ser? ")
            num_personas = int(entrada)
            if num_personas < 0:
                print("Por favor ingresa un número positivo.")
                continue
            break
        except ValueError:
            print("Por favor, ingresa un número entero válido.")

    orden_total = {}

    for i in range(1, num_personas + 1):
        print(f"\n--- Persona {i} ---")
        while True:
            try:
                entrada_cantidad = input(f"¿Cuántas pupusas quiere la persona {i}? ")
                cantidad = int(entrada_cantidad)
                if cantidad < 0:
                    print("No puedes pedir una cantidad negativa.")
                    continue
                break
            except ValueError:
                print("Por favor, ingresa un número entero válido.")

        for j in range(1, cantidad + 1):
            print(f"  Pupusa {j} de {cantidad}:")
            especialidad = input("    ¿De qué especialidad (ej. Frijol con queso, Revuelta)? ").strip().title()
            
            while True:
                masa = input("    ¿De Maíz o Arroz? ").strip().title()
                if masa in ["Maiz", "Maíz", "Arroz"]:
                    # Normalizar Maiz/Maíz
                    if masa == "Maiz":
                        masa = "Maíz"
                    break
                else:
                    print("    Por favor responde 'Maíz' o 'Arroz'.")
            
            clave = (especialidad, masa)
            if clave in orden_total:
                orden_total[clave] += 1
            else:
                orden_total[clave] = 1

    print("\n" + "="*30)
    print("RESUMEN DEL PEDIDO TOTAL")
    print("="*30)
    
    total_general = 0
    if not orden_total:
        print("No se pidieron pupusas.")
    else:
        # Ordenar para una presentación más limpia
        for (especialidad, masa), cantidad in sorted(orden_total.items()):
            print(f"- {cantidad} de {especialidad} ({masa})")
            total_general += cantidad
        
        print("-" * 30)
        print(f"Total de pupusas: {total_general}")
    print("="*30)

if __name__ == "__main__":
    main()
