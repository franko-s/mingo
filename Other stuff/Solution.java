import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This solution assumes that each cell has 8 neighbors
 * and that water will flow to the 1 of 8 with the lowest
 * altitude
 */

/**
 * @author e661914
 *
 */
public class Solution {
	private Map<Integer, Node> vertices;



	/**
	 * This class represents a single cell
	 * @author E661914
	 *
	 */
	private static class Node{
		int name;
		int value; //cell altitude
		int indeg = 0;
		List<Node> edges;
		boolean marked = false;
		/**
		 * @param name
		 * @param value
		 * @param indeg
		 */
		public Node(int name, int value) {
			super();
			this.name = name;
			this.value = value;
			this.indeg = 0;
			edges = new ArrayList<Node>();
		}

		/**
		 * Adds a directed edge to the graph from this node 
		 * to the endNode
		 * Also increments the indegree for endnode which is used 
		 * in the traversal to determine the different root nodes.
		 * @param endNode
		 */
		public void addEdge(Node endNode){
			edges.add(endNode);
			endNode.updateIndeg();
		}

		/**
		 * Increment the indegree of the edge by 1
		 */
		private void updateIndeg(){
			indeg++;
		}

		@Override
		public String toString() {
			StringBuilder sb = new StringBuilder();
			sb.append("Name: ");
			sb.append(this.getName());
			sb.append("; Value: ");
			sb.append(this.getValue());
			sb.append("; Indegree: ");
			sb.append(this.getIndeg());
			return sb.toString();
		}

		public int getIndeg() {
			return indeg;
		}

		public int getName() {
			return name;
		}

		public int getValue() {
			return value;
		}

		public List<Node> getEdges() {
			return edges;
		}

		public boolean isMarked() {
			return marked;
		}

		public void mark() {
			marked = true;
		}

	}

	/**
	 * Create a graph with the specified number of vertices
	 * @param nVertices
	 */
	public Solution(int nVertices){
		vertices = new HashMap<Integer, Node>(nVertices);
	}

	/**
	 * add a new node to the graph
	 * @param node
	 */
	public void addVertex(Node node){
		if(!vertices.containsKey(node.getName())){
			vertices.put(node.getName(), node);
		}
	}

	/**
	 * Add the directed edge from src to dest
	 * @param src
	 * @param dest
	 */
	public void addEdge(Node src, Node dest){
		if(!vertices.containsKey(src.getName())){
			addVertex(src);
		}else if(!vertices.containsKey(dest.getName())){
			addVertex(dest);
		}
		vertices.get(src.getName()).addEdge(dest);
		//System.out.println("connecting: "+ src+" to "+ dest);

	}

	/**
	 * Recursive Depth first graph traversal to get the different basins
	 * @param v
	 * @return
	 */
	private int dfs(Node node) {
		int connected = 0;
		List<Node> e = node.getEdges();
		if(e!=null && e.size()>0){
			for(Node w : e) {
				if (!w.isMarked()) {
					connected+=dfs(w);
					//System.out.println(connected);
				}
			}
		}
		node.mark();
		connected++;
		return connected;
	}

	/**
	 * DFS
	 */
	public void printBasins(){
		String out = "";
		for(Node t :vertices.values()){
			if(t.indeg<1){
				out += dfs(t) + " ";
			}
		}

		System.out.println(out.trim());
	}

	/**
	 * Util
	 */
	public void printGraph(){
		for(int key: vertices.keySet()){
			for(Node val: vertices.get(key).getEdges()){
				System.out.println(val);
			}
		}
	}

	/**
	 * Read input graph
	 * @param map
	 * @param name
	 * @return
	 */
	public static Solution createGraph(Node[][] map){
		Solution g = new Solution(map.length);
		int currentXPos = 0, currentYPos = 0;
		for(Node[] row: map){

			for(Node cell: row){
				Node lowestCell = cell;
				int left = currentXPos-1;
				int right = currentXPos+1;
				int top = currentYPos-1;
				int bottom = currentYPos+1;
				
				//System.out.println("center Current Values "+currentminIdx+ " "+ currentminVal);
				int landHeight = row.length;

				//left
				if(left>=0&&map[currentYPos][left].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					//System.out.println("before "+currentminIdx+ " "+ currentminVal);
					lowestCell = map[currentYPos][left];
					//System.out.println("after "+currentminIdx+ " "+ currentminVal);
				}

				if(right<landHeight&&map[currentYPos][right].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					lowestCell = map[currentYPos][right];
				}
				//System.out.println(" right Current Values "+currentminIdx+ " "+ currentminVal);
				if(top>=0&&map[top][currentXPos].getValue()<lowestCell.getValue()){
					lowestCell = map[top][currentXPos];
				}

				if(bottom<landHeight&&map[bottom][currentXPos].getValue()<lowestCell.getValue()){
					lowestCell = map[bottom][currentXPos];
				}

				//diagonal cells
				//System.out.println("bottom Current Values "+currentminIdx+ " "+ currentminVal);
				//top left
				if(left>=0&&top>=0&&map[top][left].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					lowestCell = map[top][left];
				}

				//top right
				if(right<landHeight&&top>=0&&map[top][right].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					lowestCell = map[top][right];
				}

				//bottom left
				if(left>=0&&bottom<landHeight&&map[bottom][left].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					lowestCell = map[bottom][left];
				}
				//bottom right
				if(right<landHeight&&bottom<landHeight&&map[bottom][right].getValue()<lowestCell.getValue()){
					//System.out.println("What?? "+map[y][right]+ " "+ currentminVal);
					lowestCell = map[bottom][right];
				}
				
				if (lowestCell.getName()!= map[currentYPos][currentXPos].getName()){
					g.addEdge(lowestCell,map[currentYPos][currentXPos]);
				}else{
					g.addVertex(map[currentYPos][currentXPos]);
				}
				currentXPos++;
			}
			currentXPos = 0;
			currentYPos++;
		}
		return g;
	}

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		//BufferedReader br = null;
		BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
		
		String input = br.readLine().trim();
		int length;
		Node[][] map;
		if(input!=null && !input.equals("")){
			length= Integer.parseInt(input);
			map = new Node[length][length];
		}
		else{
			System.err.println(" Your input is invalid. Good Bye");
			return;
		}
		
		int y = 0, name = 0, x=0;
		for(input=br.readLine();y<length;input=br.readLine(), y++, x=0){
			//System.out.println(input);
			if(input==null||input.equals("")){
				System.err.println(" Your input is invalid. Good Bye");
				return;
			}
			String[] cells = input.trim().replace("\n", "").split(" ");
			if(cells.length<length){
				System.err.println(" Your input is invalid. Good Bye");
				return;
			}
			for(String cell: input.trim().replace("\n", "").split(" ")){
				int locAsInt = Integer.parseInt(cell);
				map[y][x] = new Node(name,locAsInt);
				x++;
				name++;
				//System.out.println(name);
			}
			if(y>=length-1){
				break;
			}				
		}
		
		br.close();
		//printDFS(verts);
		//printDFS(map);

		// create graph and output.
		Solution graph = createGraph(map);
		graph.printBasins();
		//graph.printGraph();


	}

}
