<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Model Selector</title>
</head>
<body>

<label for="modelSelector">Select a Model:</label>
<select id="modelSelector" onchange="updateModel()">
    <?php
    include("models.php");
    $models = models();
    foreach ($models as $index => $model) {
        echo "<option value=\"$index\">$model</option>";
    }
    ?>
</select>

<script>
    function updateModel() {
        var selectedIndex = document.getElementById("modelSelector").value;
        var url = "setModel.php?modelIndex=" + selectedIndex;

        // Perform a GET request
        fetch(url, {
            method: 'GET',
        })
        .then(response => {
            // Handle the response as needed
            console.log('Model set successfully');
        })
        .catch(error => {
            // Handle errors
            console.error('Error setting model:', error);
        });
    }
</script>

</body>
</html>
