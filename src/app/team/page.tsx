'use client';
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { User } from "@/lib/types";
import { collection } from "firebase/firestore";
import React from "react";
import Link from "next/link";

export default function TeamPage() {
  const firestore = useFirestore();
  const { data: users, isLoading } = useCollection<User>(firestore ? collection(firestore, 'users') : null);

  const usersById = React.useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as { [key: string]: User });
  }, [users]);


  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Team">
        <Button asChild>
          <Link href="/team/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </PageHeader>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                </TableRow>
            )}
            {users?.map((user) => {
              const manager = user.managerId ? usersById[user.managerId] : null;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? "default" : user.role === 'Manager' ? 'secondary' : 'outline'}>
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{manager ? manager.name : 'N/A'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
