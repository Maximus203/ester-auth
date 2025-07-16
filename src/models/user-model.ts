import database from '../database/connection';
import { CreateUserData, UpdateUserData, User, UserWithoutPassword } from '../types/user.types';

export class UserModel {

 /**
  * Créer un nouvel utilisateur
  */
 public static async create(userData: CreateUserData): Promise<User> {
  const { firstName, lastName, email, password } = userData;

  const sql = `
      INSERT INTO users (firstName, lastName, email, password)
      VALUES (?, ?, ?, ?)
    `;

  try {
   const result = await database.run(sql, [firstName, lastName, email, password]);
   const userId = result.lastID;

   if (!userId) {
    throw new Error('Impossible de récupérer l\'ID de l\'utilisateur créé');
   }

   const user = await this.findById(userId);
   if (!user) {
    throw new Error('Utilisateur créé mais impossible de le récupérer');
   }

   return user;
  } catch (error) {
   throw new Error(`Erreur lors de la création de l'utilisateur: ${error}`);
  }
 }

 /**
  * Trouver un utilisateur par ID
  */
 public static async findById(id: number): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE id = ?';

  try {
   const user = await database.get<User>(sql, [id]);
   return user || null;
  } catch (error) {
   throw new Error(`Erreur lors de la recherche de l'utilisateur par ID: ${error}`);
  }
 }

 /**
  * Trouver un utilisateur par email
  */
 public static async findByEmail(email: string): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE email = ?';

  try {
   const user = await database.get<User>(sql, [email]);
   return user || null;
  } catch (error) {
   throw new Error(`Erreur lors de la recherche de l'utilisateur par email: ${error}`);
  }
 }

 /**
  * Récupérer tous les utilisateurs
  */
 public static async findAll(): Promise<User[]> {
  const sql = 'SELECT * FROM users ORDER BY createdAt DESC';

  try {
   const users = await database.all<User>(sql);
   return users;
  } catch (error) {
   throw new Error(`Erreur lors de la récupération des utilisateurs: ${error}`);
  }
 }

 /**
  * Mettre à jour un utilisateur
  */
 public static async update(id: number, userData: UpdateUserData): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(userData).forEach(([key, value]) => {
   if (value !== undefined) {
    fields.push(`${key} = ?`);
    values.push(value);
   }
  });

  if (fields.length === 0) {
   throw new Error('Aucune donnée à mettre à jour');
  }

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

  try {
   await database.run(sql, values);
   return await this.findById(id);
  } catch (error) {
   throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error}`);
  }
 }

 /**
  * Supprimer un utilisateur
  */
 public static async delete(id: number): Promise<boolean> {
  const sql = 'DELETE FROM users WHERE id = ?';

  try {
   const result = await database.run(sql, [id]);
   return (result.changes || 0) > 0;
  } catch (error) {
   throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error}`);
  }
 }

 /**
  * Vérifier si un email existe déjà
  */
 public static async emailExists(email: string, excludeId?: number): Promise<boolean> {
  let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
  const params: any[] = [email];

  if (excludeId) {
   sql += ' AND id != ?';
   params.push(excludeId);
  }

  try {
   const result = await database.get<{ count: number }>(sql, params);
   return (result?.count || 0) > 0;
  } catch (error) {
   throw new Error(`Erreur lors de la vérification de l'email: ${error}`);
  }
 }

 /**
  * Récupérer un utilisateur sans le mot de passe
  */
 public static async findByIdSafe(id: number): Promise<UserWithoutPassword | null> {
  const sql = 'SELECT id, firstName, lastName, email, createdAt, updatedAt FROM users WHERE id = ?';

  try {
   const user = await database.get<UserWithoutPassword>(sql, [id]);
   return user || null;
  } catch (error) {
   throw new Error(`Erreur lors de la recherche sécurisée de l'utilisateur: ${error}`);
  }
 }

 /**
  * Compter le nombre total d'utilisateurs
  */
 public static async count(): Promise<number> {
  const sql = 'SELECT COUNT(*) as count FROM users';

  try {
   const result = await database.get<{ count: number }>(sql);
   return result?.count || 0;
  } catch (error) {
   throw new Error(`Erreur lors du comptage des utilisateurs: ${error}`);
  }
 }
}
