from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ========================
# TASKS (Tareas)
# ========================
tasks = []  # Lista donde se guardan las tareas
next_id = 0  # Controla el ID autoincremental


# Servir la página HTML principal
@app.route("/")
def home():
    return render_template("index.html")


# GET /tasks - Obtener todas las tareas
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify({"tasks": tasks})


# GET /tasks/<id> - Obtener una tarea específica
@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            return jsonify(task)
    return jsonify({"error": "Task not found"}), 404


# POST /tasks - Crear una nueva tarea
@app.route("/tasks", methods=["POST"])
def add_task():
    global next_id

    data = request.json

    # Validación: el contenido es obligatorio
    if not data or not data.get("content"):
        return jsonify({"error": "Content is required"}), 400

    # Crear la nueva tarea
    task = {
        "id": next_id,
        "content": data["content"],
        "done": False,  # Por defecto, no está completada
    }

    tasks.append(task)
    next_id += 1

    return jsonify(task), 201


# PUT /tasks/<id> - Actualizar una tarea (contenido y/o estado)
@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json

    for task in tasks:
        if task["id"] == task_id:
            # Actualizar contenido si se envía
            if data and data.get("content"):
                task["content"] = data["content"]

            # Actualizar estado (done) si se envía
            if data and "done" in data:
                task["done"] = data["done"]

            return jsonify(task)

    return jsonify({"error": "Task not found"}), 404


# DELETE /tasks/<id> - Eliminar una tarea
@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            tasks.remove(task)
            return jsonify({"message": "Deleted", "task": task})

    return jsonify({"error": "Task not found"}), 404


# PUT /tasks/<id>/complete - Cambiar estado (toggle: True/False)
@app.route("/tasks/<int:task_id>/complete", methods=["PUT"])
def toggle_complete(task_id):
    for task in tasks:
        if task["id"] == task_id:
            # Cambia de True a False o de False a True
            task["done"] = not task["done"]
            return jsonify(task)

    return jsonify({"error": "Task not found"}), 404


# ========================
# USERS (Usuarios)
# ========================
users = []  # Lista donde se guardan los usuarios
next_user_id = 0  # Controla el ID autoincremental


# GET /users - Obtener todos los usuarios
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify({"users": users})


# GET /users/<id> - Obtener un usuario específico
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    for user in users:
        if user["id"] == user_id:
            return jsonify(user)

    return jsonify({"error": "User not found"}), 404


# POST /users - Crear un nuevo usuario
@app.route("/users", methods=["POST"])
def add_user():
    global next_user_id

    data = request.json

    # Validación: nombre y apellido son obligatorios
    if not data or not data.get("name") or not data.get("lastname"):
        return jsonify({"error": "Name and lastname required"}), 400

    # Crear el nuevo usuario con dirección anidada
    user = {
        "id": next_user_id,
        "name": data["name"],
        "lastname": data["lastname"],
        "address": {
            "city": data.get("city", ""),
            "country": data.get("country", ""),
            "postal_code": data.get("postal_code", ""),
        },
    }

    users.append(user)
    next_user_id += 1

    return jsonify(user), 201


# PUT /users/<id> - Actualizar un usuario
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json

    for user in users:
        if user["id"] == user_id:
            # Actualizar campos simples
            if "name" in data:
                user["name"] = data["name"]
            if "lastname" in data:
                user["lastname"] = data["lastname"]

            # Actualizar dirección (solo los campos que se envían)
            if "city" in data:
                user["address"]["city"] = data["city"]
            if "country" in data:
                user["address"]["country"] = data["country"]
            if "postal_code" in data:
                user["address"]["postal_code"] = data["postal_code"]

            return jsonify(user)

    return jsonify({"error": "User not found"}), 404


# DELETE /users/<id> - Eliminar un usuario
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    for user in users:
        if user["id"] == user_id:
            users.remove(user)
            return jsonify({"message": "User deleted"})

    return jsonify({"error": "User not found"}), 404


# ========================
# INICIAR EL SERVIDOR
# ========================
if __name__ == "__main__":
    app.run(debug=True)
