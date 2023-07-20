import {TodoItem} from "../models/TodoItem";
import { AttachmentUtils } from '../helpers/attachmentUtils'
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {ToDoAccess} from "../dataLayer/ToDoAccess";

const uuidv4 = require('uuid/v4');
const toDoAccess = new ToDoAccess();
const attachmentUtils = new AttachmentUtils()

export async function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllToDo(userId);
}

export function createToDo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    const todoId =  uuidv4();
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    // const s3BucketName = process.env.S3_BUCKET_NAME;
    
    return toDoAccess.createToDo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  s3AttachmentUrl, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}

//Delete todo attachment by id
export async function deleteTodoAttachment(todoId: string, userId: string) {
    const thisTodo = await toDoAccess.getTodo(todoId, userId);
    await attachmentUtils.deleteTodoAttachment(thisTodo.attachmentUrl)
    await attachmentUtils.updateTodoAttachmentUrl(todoId, userId, "");
    return thisTodo;
}

//Check todo is exists
export async function todoExists(todoId: string, userId: string) {
    return toDoAccess.todoExists(todoId, userId);
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDo(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return toDoAccess.generateUploadUrl(todoId);
}