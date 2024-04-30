function adjustVisibility(selectedOption) {
            // Hide all elements initially
            const elements = ['lengthWrapper', 'thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper'];
            const inputs = ['length', 'thickness', 'huv_amount', 'huv_length', 'sheet_amount', 'sheet_length'];
            elements.forEach(el => document.getElementById(el).style.display = 'none');
            inputs.forEach(el => document.getElementById(el).value = '');
            document.getElementById('submitWrapper').style.display = 'none'; // Make sure to handle submit button visibility correctly.

            document.getElementById('result_label').innerHTML = '';
            document.getElementById('count_label').innerHTML = '';

            // Show elements based on selection
            document.getElementById('spoolDiameterWrapper').style.display = 'block'; // Bobin diameter always visible.
            switch(selectedOption) {
                case 'no_option':
                    break;
                case 'foil_option':
                case 'tube_option':
                case 'folded_tube_option':
                    ['lengthWrapper', 'thicknessWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'huv_option':
                    ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'folded_huv_option':
                    ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'sheet_option':
                    ['thicknessWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
            }
        }

        function m_to_mm(length) {
            return length * 1000;
        }

        function amount_to_length(amount, product_length) {
            return amount * product_length;
        }

        function handleOption() {
            const input = getInputValues()
            let layer = 0;
            let length = 0;
            document.getElementById('result_label').innerHTML = '';
            document.getElementById('count_label').innerHTML = '';


            switch (input.selectedValue) {
                case "no_option":
                    console.log("No product selected.");
                    break;
                case "foil_option":
                    console.log("Folie selected.");
                    layer = 2; // 1 layers * 2 sides
                    length = m_to_mm(input.length_m);
                    break;
                case "tube_option":
                    console.log("Slang selected.");
                    layer = 4; // 2 layers * 2 sides
                    length = m_to_mm(input.length_m);
                    break;
                case "folded_tube_option":
                    console.log("Slang m. invik selected.");
                    layer = 8; // 4 layers * 2 sides
                    length = m_to_mm(input.length_m);
                    break;
                case "huv_option":
                    console.log("Pallhuv selected.");
                    layer = 4; // 2 layers * 2 sides
                    length = amount_to_length(input.huvAmount, input.huvLength)
                    break;
                case "folded_huv_option":
                    console.log("Pallhuv m. invik selected.");
                    layer = 8; // 4 layers * 2 sides
                    length = amount_to_length(input.huvAmount, input.huvLength)
                    break;
                case "sheet_option":
                    console.log("Toppark selected.");
                    layer = 2; // 1 layers * 2 sides
                    length = amount_to_length(input.sheetAmount, input.sheetLength)
                    break;
                default:
                    console.log("Unknown selection.");
            }

            console.log(input.spoolDiameter);
            console.log(input.thickness );
            console.log(length);
            console.log(layer);

            if(input.spoolDiameter && input.thickness && length && layer) {
                const result = calculateSpoolDiameter(length, input.thickness, input.spoolDiameter, layer )
                console.log(result.result_string);
                console.log(result.result);
                console.log(result.count);
            }
        }

        function getInputValues() {
            const selectedValue = document.getElementById('productOption').value || "0";
            let spoolDiameter = document.getElementById('spool_diameter').value || "0";
            const length_m = document.getElementById('length').value || "0";
            const thickness = document.getElementById('thickness').value || "0";
            const huvAmount = document.getElementById('huv_amount').value || "0";
            const huvLength = document.getElementById('huv_length').value || "0";
            const sheetAmount = document.getElementById('sheet_amount').value || "0";
            const sheetLength = document.getElementById('sheet_length').value || "0";



            // Validate integer values
            if (!isInteger(spoolDiameter) || !isInteger(huvAmount) || !isInteger(huvLength) || !isInteger(sheetAmount) || !isInteger(sheetLength)) {
                console.log('One or more fields are not valid integers.');
                return null; // Return null or handle the error appropriately
            }

            // Validate length to allow decimals
            if (!isNumber(length_m) || !isNumber(thickness)) {
                console.log('One or more fields are not valid numbers.');
                return null; // Return null or handle the error appropriately
            }

            let new_length_m = length_m.replace(',', '.');
            let new_thickness = thickness.replace(',', '.');


            return {
                selectedValue: selectedValue,
                spoolDiameter: parseInt(spoolDiameter),
                length_m: parseFloat(new_length_m),
                thickness: parseFloat(new_thickness),
                huvAmount: parseInt(huvAmount),
                huvLength: parseInt(huvLength),
                sheetAmount: parseInt(sheetAmount),
                sheetLength: parseInt(sheetLength)
            };
        }

        // Helper functions to check for integers and numeric values
        function isInteger(value) {
            const num = parseInt(value, 10);
            return !isNaN(num) && (num.toString() === value);
        }

        function isNumber(value) {
            const num = parseFloat(value);
            return !isNaN(num) && (value.toString() === num.toString());
        }


        function calculateSpoolDiameter(length, thickness, spoolDiameter, layer) {
            const totalMm = thickness * layer; // Total amount of mm added to the diameter per iteration
            const resultDict = {};
            const spoolDiameterCm = spoolDiameter / 10; // mm -> cm
            let lengthSum = 0;
            let count = 0;

            while (lengthSum + spoolDiameter < length) {
                const term = (spoolDiameter + totalMm * count) * Math.PI;
                lengthSum += term;
                count += 1;
            }

            resultDict.resultStr = `${((count * totalMm) / 10 + spoolDiameterCm).toFixed(2)} cm`;
            resultDict.result = (count * totalMm) / 10 + spoolDiameterCm;
            resultDict.count = count;

            document.getElementById('result_label').innerHTML = 'Diameter: ' + resultDict.resultStr;
            document.getElementById('count_label').innerHTML = 'Antal varv: ' + resultDict.count;

            return {
                result_string: resultDict.resultStr,
                result: resultDict.result,
                count: resultDict.count
            };
        }

        // Initialize to hide all optional fields
        window.onload = function() {
            // Set the spool diameter to 90
            var spoolDiameterInput = document.getElementById('spool_diameter');
            spoolDiameterInput.value = 90;

            // Set the dropdown option to 'no_option'
            var productOptionSelect = document.getElementById('productOption');
            productOptionSelect.value = 'no_option';
            adjustVisibility('no_option');
        };