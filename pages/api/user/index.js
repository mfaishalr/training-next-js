import nc from 'next-connect'
import bcrypt from 'bcryptjs'
import isNumber from 'lodash'
import ErrorHandler from "@/src/handler/error.handler";
import UserController from "@/src/controllers/user.controller";

const handler = nc(ErrorHandler)

handler.post(async (req,res) => {

    let inputDTO = req.body

    //check email
    let salt = bcrypt.genSaltSync(18)
    let hashPassword = bcrypt.hashSync(inputDTO?.password,salt)
    Reflect.set(inputDTO,'password',hashPassword)
    Reflect.set(inputDTO,'salt',salt)

    //create new user
    const [ err, data ] = await new UserController({
        fields: inputDTO
    }).create()

    if (err) {
        return res.status(400).json({
            message: err?.message ?? "Error: Some error"
        })
    }

    //activation email
    Reflect.deleteProperty(data,'password')
    Reflect.deleteProperty(data,'salt')

    return res.status(200).json({
        message: "OK",
        data: data
    })

})

handler.delete(async (req,res) => {
    try {
        const inputDto = req.body

        const [ err , data ] = await new UserController({
            key: inputDto?.key ?? "id",
            value: isNumber(inputDto?.value) ? Number(inputDto?.value) : inputDto?.value ?? null
        }).delete()

        if (err) {
            return res.status(400).json({
                error: true,
                message: err?.message ?? 'Bad request'
            })
        }

        return res.status(200).json({
            message: "OK",
            data: data
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: err?.message ?? 'Exception error'
        })
    }
})

export default handler