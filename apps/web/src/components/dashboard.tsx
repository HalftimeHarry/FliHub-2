import { useEffect, useState } from 'react';
import {
  fetchDepartments,
  fetchPlayers,
  fetchProjects,
  fetchReimbursementClaims,
  fetchTournamentRegistrations,
  fetchTournaments,
  type DepartmentDto,
  type PlayerDto,
  type ProjectDto,
  type ReimbursementClaimDto,
  type TournamentDto,
  type TournamentRegistrationDto
} from '@/lib/api.js';
import { Badge } from '@/components/ui/badge.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js';

interface DashboardData {
  readonly players: readonly PlayerDto[];
  readonly tournaments: readonly TournamentDto[];
  readonly registrations: readonly TournamentRegistrationDto[];
  readonly departments: readonly DepartmentDto[];
  readonly projects: readonly ProjectDto[];
  readonly claims: readonly ReimbursementClaimDto[];
}

export function Dashboard({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<DashboardData | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetchPlayers(),
      fetchTournaments(),
      fetchTournamentRegistrations(),
      fetchDepartments(),
      fetchProjects(),
      fetchReimbursementClaims()
    ]).then(([players, tournaments, registrations, departments, projects, claims]) => {
      if (!cancelled) {
        setData({ players, tournaments, registrations, departments, projects, claims });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="players">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.id}</TableCell>
                    <TableCell>{player.displayName}</TableCell>
                    <TableCell>
                      <Badge variant={player.active ? 'default' : 'secondary'}>
                        {player.active ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="tournaments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>{tournament.id}</TableCell>
                    <TableCell>{tournament.name}</TableCell>
                    <TableCell>{tournament.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="registrations">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Registered at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>{registration.tournamentId}</TableCell>
                    <TableCell>{registration.playerId}</TableCell>
                    <TableCell>
                      {new Date(registration.registeredAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="departments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.id}</TableCell>
                    <TableCell>{department.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="projects">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.departmentId}</TableCell>
                    <TableCell>{project.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="claims">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.id}</TableCell>
                    <TableCell>{claim.departmentId}</TableCell>
                    <TableCell>
                      {(claim.totalMinorUnits / 100).toFixed(2)} {claim.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
