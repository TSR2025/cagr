import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MilestoneTableProps {
  data: ProjectionResult;
}

export function MilestoneTable({ data }: MilestoneTableProps) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="px-4 pt-4 pb-2">
        <h3 className="text-base font-semibold text-slate-900">Milestones (Every 5 Years)</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Contributions</TableHead>
              <TableHead>Interest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.milestones.map((row) => (
              <TableRow key={row.year}>
                <TableCell>{row.year}</TableCell>
                <TableCell>{formatCurrency(row.balance)}</TableCell>
                <TableCell>{formatCurrency(row.totalContributions)}</TableCell>
                <TableCell>{formatCurrency(row.totalInterest)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
