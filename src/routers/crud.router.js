import express from "express"
import {prisma} from "../utils/prisma/index.js"
import authMiddleware from "../middleware/authMiddleware.js" // 가상 인증 미들웨어

const router = express.Router()

// 게시물 조회
router.get("/post-views", authMiddleware, async (req, res) => {
    try {
        const {userId} = req.account // 인증 미들웨어
        if(!userId){
            return res.status(404).json({ message: "인증 되지 않은 사용자는 게시물 조회가 불가능합니다" })
        }
        const result = await prisma.post.findMany({
            where: {userId},
            select: {
                title: true,
                content: true
            }
        })
        res.status(200).json({ result })
    } catch (error) {
        return res.status(500).json({ message: "게시물 조회 에러가 발생했습니다" })
    }
})

// 게시물 작성
router.post("/post-creat", authMiddleware, async (req, res) => {
    try {
        const {userId} = req.account // 인증 미들웨어
        if(!userId){
            return res.status(404).json({ message: "인증 되지 않은 사용자는 게시물 작성이 불가능합니다" })
        }
        const { title, content } = req.body
        await prisma.post.create({
            data: {
                title,
                content,
                userId
            }
        })
        const posts = await prisma.post.findMany({
            orderBy : { createdAt: "desc"}
        })

        return res.status(201).json({ message: "게시물이 작성되었습니다", posts })
    } catch (error) {
        return res.status(500).json({ message: "게시물 작성에 에러가 발생했습니다" })
    }
})

// 게시물 수정
router.patch("/post-edit", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.account // 인증 미들웨어
        const { title, content } = req.body
        if(!userId){
            return res.status(404).json({ message: "인증 되지 않은 사용자는 게시물 수정 불가능합니다" })
        }

        const the_post = await prisma.post.findFirst({ where: { userId , title } })
        if (!the_post) {
            return res.status(404).json({ message: `${title} 해당 게시물을 찾을 수 없습니다` })
        }

        // 게시물 수정
        await prisma.post.update({
            where: { postsid: the_post.postsid },
            data: {title,content}
        })
        const posts = await prisma.post.findMany({
            orderBy: {createdAt : "desc"}
        })


        return res.status(200).json({ message: "게시물이 수정되었습니다", posts })
    } catch (error) {
        return res.status(500).json({ message: "게시물 수정에 에러가 발생했습니다" })
    }
})

// 게시물 삭제
router.delete("/post-delete", authMiddleware, async (req, res) => {
    try {
        const {userId} = req.account // 인증 미들웨어
        const {title} = req.body
        if(!userId){
            return res.status(404).json({ message: "인증 되지 않은 사용자는 게시물 삭제 불가능합니다" })
        }

        const post = await prisma.post.findFirst({ where: { userId ,title } })
        if (!post) {
            return res.status(404).json({ message: `${title} 해당 게시물을 찾을 수 없습니다` })
        }

        // 게시물 삭제
        await prisma.post.delete({
            where: { postsid: post.postsid }
        })

        const posts = await prisma.post.findMany({
            orderBy : {createdAt: "desc"}
        })

        return res.status(200).json({ message: "게시물이 삭제되었습니다" , posts })
    } catch (error) {
        return res.status(500).json({ message: "게시물 삭제에 에러가 발생했습니다" })
    }
})

export default router
