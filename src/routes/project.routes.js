const express = require("express");
const router = express.Router();
const ProjectModel = require("../models/Project.model");
// Importando a definição de tipo dos _ids do Mongo
const { ObjectId } = require("mongoose").Types;

// CRUD de projeto

// Definindo nossos route listeners

// Crud (Create) => POST
router.post("/project", (req, res, next) => {
  // Os dados enviados pelo cliente (pode ser o Insomnia ou o Axios no React) estarão no objeto req.body
  console.log(req.body);

  // Inserindo os dados no banco
  ProjectModel.create(req.body)
    .then((result) => {
      // Result vai ser o objeto criado no MongoDB
      return res.status(201).json(result);
    })
    // Repassando o erro para o route listener de captura de erros padrão
    .catch((err) => next(err));
});

// cRud (Read) => GET (Lista)
router.get("/project", (req, res, next) => {
  ProjectModel.find()
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => next(err));
});

// cRud (Read) => GET (Detalhe)
router.get("/project/:id", (req, res, next) => {
  ProjectModel.findOne({ _id: req.params.id })
    // O populate vai "popular" automaticamente o campo tasks do projeto com os objetos completos de tarefa, ao invés de trazer somente o id
    .populate("tasks")
    // Caso quiséssemos apenas alguns campos da tarefa, poderíamos usar a chave select
    // .populate({
    //   path: "tasks",
    //   model: "Task",
    //   select: { _id: 0, description: 1, status: 1 },
    // })
    .then((result) => {
      if (!result) {
        return res.status(404).json({ msg: "Projeto não encontrado." });
      }

      return res.status(200).json(result);
    })
    .catch((err) => next(err));
});

// crUd (Update) => PATCH
router.patch("/project/:id", async (req, res, next) => {
  try {
    const result = await ProjectModel.findOneAndUpdate(
      // Valida se o parâmetro de rota é um _id do Mongo válido
      { _id: ObjectId(req.params.id) },
      { $set: { ...req.body } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ msg: "Projeto não encontrado" });
    }

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

// cruD (Delete) => DELETE
router.delete("/project/:id", (req, res, next) => {
  ProjectModel.deleteOne({ _id: ObjectId(req.params.id) })
    .then((result) => {
      if (result.deletedCount < 1) {
        return res.status(404).json({ msg: "Projeto não encontrado" });
      }

      // Por convenção do HTTP, devemos retornar um objeto vazio no sucesso da deleção
      return res.status(200).json({});
    })
    .catch((err) => next(err));
});

module.exports = router;