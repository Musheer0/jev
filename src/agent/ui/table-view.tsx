import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableBlock } from "./response";

export function TableView({ block }: { block: TableBlock }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{block.headers.map((header, index) => <TableHead key={`${header}-${index}`} className="whitespace-nowrap">{header}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{block.rows.map((row, rowIndex) => <TableRow key={rowIndex}>{block.headers.map((_, cellIndex) => <TableCell key={cellIndex} className="min-w-28 align-top">{row[cellIndex] ?? "—"}</TableCell>)}</TableRow>)}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
